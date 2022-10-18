import { Injectable, Logger } from '@nestjs/common';
import { IPBFT, ITransaction, zeroX } from '@taraxa_project/explorer-shared';
import _ from 'lodash';
import { ChainState } from 'src/types/chainState';
import DagService from '../dag/dag.service';
import PbftService, { IGQLPBFT, RPCPbft } from '../pbft/pbft.service';
import TransactionService from '../transaction/transaction.service';
import RPCConnectorService from './rpcConnector.service';
import { BigInteger } from 'jsbn';
import { GraphQLConnector } from './graphQLConnector.service';
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
    private readonly graphQLConnector: GraphQLConnector,
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

  /**
   * Syncs the current chain state via Taraxa NodeRPC
   */
  private async reSyncChainState() {
    const blockNumber = parseInt(await this.rpcConnector.blockNumber(), 16);
    const dagBlockLevel = parseInt(await this.rpcConnector.dagBlockLevel(), 16);
    const dagBlockPeriod = parseInt(
      await this.rpcConnector.dagBlockPeriod(),
      16
    );

    const genesis = (
      await this.graphQLConnector.getBlocksByNumberFromTo(0, 0)
    )[0];
    const block = (
      await this.graphQLConnector.getBlocksByNumberFromTo(
        blockNumber,
        blockNumber
      )
    )[0];

    this.chainState = {
      number: block.number,
      hash: block.hash,
      genesis: genesis.hash,
      dagBlockLevel,
      dagBlockPeriod,
    };
  }

  /**
   * @deprecated
   * A newer, faster GraphQL interface has been implemented to get this data.
   * Use this method only if you cannot connect to the Taraxa node GraphQL inteface
   */
  private async reSyncChainStateRPC() {
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

  /**
   * Syncs the current database content headers in-memory.
   */
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

  /**
   * @deprecated Getting tx receipts is not longer needed as they are embedded in the new GraphQL interface's response.
   * @param hashes the hashes for which the receipts will be fetched
   * @param limit the amount of receipts to fetch
   * @returns
   */
  private async getTransactionReceipts(
    hashes: string[],
    limit = 0
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

  /**
   * Syncs the missing chain history to the explorer's database using the new Taraxa Node GraphQL inteface.
   * @returns void
   */
  public async runHistoricalSync(): Promise<void> {
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
      zeroX(this.chainState.genesis) !== this.syncState.genesis
    ) {
      this.logger.log('New genesis block hash. Restarting chain sync.');
      console.log('New genesis block hash. Restarting chain sync.');
      // reset the database
      await this.txService.clearTransactionData();
      await this.dagService.clearDagData();
      await this.pbftService.clearPbftData();
      this.syncState = {
        number: 0,
        hash: '',
        genesis: '',
        dagBlockLevel: 0,
        dagBlockPeriod: 0,
      };
      verifiedTip = true;
    }

    while (!verifiedTip) {
      const chainBlockAtSyncNumber = await this.rpcConnector.getBlockByNumber(
        this.syncState.number
      );
      if (chainBlockAtSyncNumber?.hash !== this.syncState.hash) {
        console.log(
          'Block hash at height',
          this.syncState.number,
          'has changed. Re-org detected, walking back.'
        );
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

    // @note : Right now there is no way to get the genesis transactions to set:
    // Initial validators, initial balances for delegators and faucet.
    // big TODO

    while (this.syncState.number < this.chainState.number) {
      const blocksWithTransactions: IGQLPBFT[] =
        await this.graphQLConnector.getBlocksByNumberFromTo(
          this.syncState.number,
          this.chainState.number
        );
      console.log(blocksWithTransactions);

      const iBlocks = blocksWithTransactions.map((block) =>
        this.pbftService.pbftGQLToIPBFT(block)
      );
      for (const block of iBlocks) {
        const started = new Date();
        let blockReward = new BigInteger('0', 10);

        block.transactions?.map(async (tx) =>
          this.txService.populateTransactionWithPBFT(tx, block)
        );
        block.transactions?.forEach((tx: ITransaction) => {
          const gasUsed = new BigInteger(tx.gasUsed.toString() || '0');
          tx.gasUsed = gasUsed.toString();
          const gasPrice = new BigInteger(tx.gasPrice.toString() || '0');
          tx.gasPrice = gasPrice.toString();
          const reward = gasUsed.multiply(gasPrice);
          const newVal = blockReward.add(reward);
          blockReward = newVal;
        });

        block.reward = blockReward.toString();
        const blockToSave = { ...block };
        blockToSave.transactions = block.transactions;
        blockToSave.transactionCount = block.transactions
          ? block.transactions?.length
          : block.transactionCount;

        const savedBlock = await this.pbftService.safeSavePbft(blockToSave);

        if (savedBlock) {
          this.logger.log(`Finalized block ${savedBlock.hash}`);
        }

        // update sync state
        this.syncState.number = block.number;
        this.syncState.genesis = this.chainState.genesis;
        this.syncState.hash = block.hash;

        const completed = new Date();
        this.logger.log(
          'Synced block',
          this.syncState.number,
          this.syncState.hash,
          'with',
          block.transactions?.length || 0,
          'transactions, in',
          completed.getTime() - started.getTime(),
          'ms'
        );
      }
    }
  }

  /**
   * @deprecated
   * Using the Taraxa nodeRPC syncing bigger amount of blocks took too long.
   * Taking transactions one by one from the RPC endpoint takes at around ±500ms each so syncing is unfeasible.
   * Use this only if there is no way to connect to the GraphQL endpoints.
   */
  public async runHistoricalSyncRPC(): Promise<void> {
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
      const started = new Date();
      const blockRpc: RPCPbft = await this.rpcConnector.getBlockByNumber(
        this.syncState.number + 1
      );

      const block = this.pbftService.pbftRpcToIPBFT(blockRpc);
      this.logger.log(
        `Getting ${block.transactions.length} transactions for block ${
          this.syncState.number + 1
        }...`
      );
      const blockTxs: ITransaction[] = [];
      const fetchTxStart = new Date();
      for (let i = 0; i < block.transactions.length; i++) {
        this.logger.debug(
          `Getting transaction #${i + 1} out of #${
            block.transactions.length
          } - ${block.transactions[i]?.hash}`
        );

        if (block.transactions[i]) {
          const fetchStart = new Date();
          const tx = await this.rpcConnector.getTransactionByHash(
            block.transactions[i].hash
          );
          const fetchEnd = new Date();
          console.log(
            `Fetched tx ${block.transactions[i].hash} in ${
              fetchEnd.getTime() - fetchStart.getTime()
            }ms.`
          );
          blockTxs.push(
            this.txService.populateTransactionWithPBFT(
              this.txService.txRpcToITransaction(tx),
              block
            )
          );
        }
      }
      const fetchTxEnd = new Date();
      console.log(
        `Fetched ${block.transactions?.length} tx-es in ${
          fetchTxEnd.getTime() - fetchTxStart.getTime()
        } ms.`
      );

      if (!block.hash) {
        continue;
      }

      let blockReward = new BigInteger('0', 10);

      // @note : Right now there is no way to get the genesis transactions to set:
      // Initial validators, initial balances for delegators and faucet.
      // big TODO

      const txReceipts = await this.getTransactionReceipts(
        blockTxs.map((tx) => tx.hash),
        20
      );

      Array.from(new Set(blockTxs)).forEach((tx: ITransaction, idx: number) => {
        const receipt = txReceipts[idx];
        tx.status = parseInt(receipt.status, 16);
        tx.index = parseInt(receipt.transactionIndex, 16);
        const gasUsed = new BigInteger(receipt.gasUsed || '0x0', 16);
        tx.gasUsed = gasUsed.toString();
        const gasPrice = new BigInteger(tx.gasPrice || '0x0', 16);
        tx.gasPrice = gasPrice.toString();
        tx.cumulativeGasUsed = Number(
          new BigInteger(receipt.cumulativeGasUsed || '0x0', 16)
        );
        const reward = gasUsed.multiply(gasPrice);
        const newVal = blockReward.add(reward);
        blockReward = newVal;
      });

      block.reward = blockReward.toString();
      const blockToSave = { ...block };
      blockToSave.transactions = blockTxs;
      blockToSave.transactionCount = blockTxs.length;

      const savedBlock = await this.pbftService.safeSavePbft(blockToSave);

      if (savedBlock) {
        this.logger.log(`Finalized block ${savedBlock.hash}`);
      }

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
