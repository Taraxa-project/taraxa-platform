import { Injectable, Logger } from '@nestjs/common';
import { IPBFT, ITransaction } from '@taraxa_project/taraxa-models';
import _ from 'lodash';
import { NewPbftBlockHeaderResponse } from 'src/types';
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
    console.log('Historical syncer started.');
  }

  public get getChainState() {
    return this.chainState;
  }

  public get getSyncState() {
    return this.syncState;
  }

  private async reSyncChainState() {
    const blockNumber = parseInt(await this.rpcConnector.blockNumber(), 16);
    const dagBlockLevel = parseInt(await this.rpcConnector.dagBlockLevel(), 16);
    const dagBlockPeriod = parseInt(
      await this.rpcConnector.dagBlockPeriod(),
      16
    );

    const genesis = await this.rpcConnector.getBlockByNumber(0);
    const block = await this.rpcConnector.getBlockByNumber(blockNumber);

    this.chainState = {
      number: block.number,
      hash: block.hash,
      genesis: genesis.hash,
      dagBlockLevel,
      dagBlockPeriod,
    };
  }

  private async reSyncCurrentState() {
    const genesisBlock = await this.pbftService.getBlockByNumber(0);
    const lastBlocks = await this.pbftService.getPbftsOfLastLevel(1);
    const lastDagBlocksByLevel = await this.dagService.getDagsFromLastLevel(1);
    const lastDagBlocksByPeriod =
      await this.dagService.getLastDagFromLastPbftPeriod(1);

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
    console.log('Historical sync started');
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
      console.log('New genesis block hash. Restarting chain sync.');
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
      console.log(`Getting block ${this.syncState.number + 1}...`);
      this.logger.log(`Getting block ${this.syncState.number + 1}...`);
      const blockRpc: NewPbftBlockHeaderResponse =
        await this.rpcConnector.getBlockByNumber(this.syncState.number + 1);

      const block = this.pbftService.pbftRpcToIPBFT(blockRpc);
      this.logger.log(
        `Getting ${block.transactions.length} transactions for block ${
          this.syncState.number + 1
        }...`
      );
      const blockTxs: ITransaction[] = [];
      for (let i = 0; i < block.transactions.length; i++) {
        this.logger.log(
          `Getting transaction #${i + 1} out of #${
            block.transactions.length
          } - ${block.transactions[i]}...`
        );
        const tx = await this.rpcConnector.getTransactionByHash(
          block.transactions[i].hash
        );
        blockTxs.push(
          this.txService.populateTransactionWithPBFT(
            this.txService.txRpcToITransaction(tx),
            block
          )
        );
      }

      block.transactions = blockTxs;

      if (!block.hash) {
        continue;
      }

      const started = new Date();
      let blockReward = 0;

      // @note : Right now there is no way to get the genesis transactions to set:
      // Initial validators, initial balances for delegators and faucet.
      // big TODO

      const txReceipts = await this.getTransactionReceipts(
        block.transactions?.map((tx) => tx.hash),
        20
      );

      block.transactions.forEach((tx: ITransaction, idx: number) => {
        const receipt = txReceipts[idx];
        blockReward =
          blockReward + Number(receipt.gasUsed) * Number(tx.gasPrice);
      });

      for (const trans of block.transactions) {
        await this.txService.safeSaveTx(trans);
      }

      block.reward = blockReward;

      const savedBlock = await this.pbftService.safeSavePbft(block);
      console.log(`Finalized block ${savedBlock.hash}`);
      this.logger.log(`Finalized block ${savedBlock.hash}`);

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
        block.transactions?.length,
        'transactions, in',
        completed.getTime() - started.getTime(),
        'ms'
      );
    }
  }
}
