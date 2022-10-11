import { Injectable, Logger } from '@nestjs/common';
import { IPBFT, ITransaction } from '@taraxa_project/taraxa-models';
import _ from 'lodash';
import { ChainState } from 'src/types/chainState';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';
import TransactionService from '../transaction/transaction.service';
import RPCConnectorService from './rpcConnector.service';

@Injectable()
export default class HistoricalSyncService {
  private readonly logger: Logger = new Logger(HistoricalSyncService.name);
  private isRunning = false;
  private chainState = {} as ChainState;
  private syncState = {} as ChainState;
  constructor(
    private readonly dagService: DagService,
    private readonly pbftService: PbftService,
    private readonly txService: TransactionService,
    private readonly rpcConnector: RPCConnectorService
  ) {
    this.logger.log('Historical syncer started.');
  }

  public get getChainState() {
    return this.chainState;
  }

  public get getSyncState() {
    return this.syncState;
  }

  private async reSyncChainState() {
    const state = await Promise.all([
      this.rpcConnector.blockNumber(),
      this.rpcConnector.dagBlockLevel(),
      this.rpcConnector.dagBlockPeriod(),
    ]);
    const blockNumber = parseInt(state[0], 16);
    const dagBlockLevel = parseInt(state[1], 16);
    const dagBlockPeriod = parseInt(state[2], 16);

    const blocks = await Promise.all([
      this.rpcConnector.getBlockByNumber(0),
      this.rpcConnector.getBlockByNumber(blockNumber),
    ]);

    const genesis = blocks[0];
    const block = blocks[1];

    this.chainState = {
      number: block.number,
      hash: block.hash,
      genesis: genesis.hash,
      dagBlockLevel,
      dagBlockPeriod,
    };
  }

  private async reSyncCurrentState() {
    const blocks = await Promise.all([
      this.pbftService.getBlockByNumber(0),
      this.pbftService.getPbftsOfLastLevel(1),
      this.dagService.getDagsFromLastLevel(1),
      this.dagService.getLastDagFromLastPbftPeriod(1),
    ]);
    const genesisBlock = blocks[0];
    const lastBlocks = blocks[1];
    const lastDagBlocksByLevel = blocks[2];
    const lastDagBlocksByPeriod = blocks[3];

    const _syncState = {
      hash: '',
      genesis: '',
      number: -1,
      dagBlockLevel: 0,
      dagBlockPeriod: -1,
    };

    if (lastBlocks[0]) {
      _syncState.number = lastBlocks[0].number;
    }

    if (genesisBlock) {
      _syncState.genesis = genesisBlock.hash;
    }

    if (lastBlocks.length) {
      _syncState.hash = lastBlocks[0].hash;
    }

    if (lastDagBlocksByLevel.length) {
      _syncState.dagBlockLevel = lastDagBlocksByLevel[0].level;
    }

    if (lastDagBlocksByPeriod.length) {
      _syncState.dagBlockPeriod = lastDagBlocksByPeriod[0].pbftPeriod;
    }

    this.syncState = _syncState;
  }

  private async getTransactionReceipts(
    hashes: string[],
    limit: number
  ): Promise<any[]> {
    const _hashes = Object.assign([], _.zip(hashes, _.range(hashes.length)));
    const results: any[] = [];

    const awaitWorker = async () => {
      while (_hashes.length > 0) {
        const [hash, idx] = _hashes.pop();
        results[idx] = await this.rpcConnector.getTransactionReceipt(hash);
      }
    };

    await Promise.all(_.range(limit).map(awaitWorker));

    return results;
  }

  public async runHistoricalSync() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logger.log('Historical sync started');
    //reset state
    await this.reSyncChainState();
    await this.reSyncCurrentState();

    let verifiedTip = false;

    // if genesis block changes, resync
    if (
      !this.chainState.genesis ||
      this.chainState.genesis !== this.syncState.genesis
    ) {
      this.logger.log('New genesis block hash. Restarting chain sync.');
      // reset the database
      await this.txService.clearTransactionData();
      await this.dagService.clearDagData();
      await this.pbftService.clearPbftData();
      this.syncState = {
        number: -1,
        hash: '',
        genesis: '',
        dagBlockLevel: 0,
        dagBlockPeriod: -1,
      };
      verifiedTip = true;
    }

    while (!verifiedTip) {
      const chainBlockAtSyncNumber = await this.rpcConnector.getBlockByNumber(
        this.syncState.number
      );
      if (chainBlockAtSyncNumber?.hash !== this.syncState.hash) {
        this.logger.log(
          'Block hash at height',
          this.syncState.number,
          'has changed. Re-org detected, walking back.'
        );
        const lastBlock = await this.pbftService.getBlockByHash(
          this.syncState.hash
        );
        // go back a step
        this.syncState.number = Number(lastBlock.number) - 1;
        this.syncState.hash = lastBlock.parent;
      } else {
        verifiedTip = true;
      }
    }

    // sync blocks to tip
    while (this.syncState.number < this.chainState.number) {
      this.logger.log(`Getting block ${this.syncState.number + 1}...`);
      const block: IPBFT = await this.rpcConnector.getBlockByNumber(
        this.syncState.number + 1
      );

      this.logger.log(
        `Getting ${block.transactions.length} transactions for block ${
          this.syncState.number + 1
        }...`
      );
      const blockTxs = [];
      for (let i = 0; i < block.transactions.length; i++) {
        this.logger.log(
          `Getting transaction #${i + 1} out of #${
            block.transactions.length
          } - ${block.transactions[i]}...`
        );
        const tx = await this.rpcConnector.getTransactionByHash(
          block.transactions[i]?.hash
        );
        blockTxs.push(tx);
      }

      block.transactions = blockTxs;

      if (!block.hash) {
        continue;
      }

      const started = new Date();
      const txHashes: string[] = [];
      let blockReward = 0;

      const minBlock = Object.assign({}, block);

      // @note : Right now there is no way to get the genesis transactions to set:
      // Initial validators, initial balances for delegators and faucet.
      // big TODO

      const txReceipts = await this.getTransactionReceipts(
        block.transactions.map((tx: ITransaction) => tx.hash),
        20
      );

      block.transactions.forEach((tx: ITransaction, idx: number) => {
        txHashes.push(tx.hash);
        const receipt = txReceipts[idx];
        blockReward =
          blockReward + Number(receipt.gasUsed) * Number(tx.gasPrice);
      });

      minBlock.reward = blockReward;
      minBlock.transactions = block.transactions;

      this.logger.log(`Finalized block ${minBlock.hash}`);

      await Promise.all(
        block.transactions?.map((tx) => this.txService.safeSaveTransaction(tx))
      );

      await this.pbftService.safeSavePbft(block);

      // update sync state
      this.syncState.number = block.number;
      this.syncState.genesis = this.chainState.genesis;
      this.syncState.hash = block.hash;

      const completed = new Date();
      console.log(
        'Synced block',
        this.syncState.number,
        this.syncState.hash,
        'with',
        txHashes.length,
        'transactions, in',
        completed.getTime() - started.getTime(),
        'ms'
      );
    }
  }
}
