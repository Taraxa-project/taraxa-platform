import { Injectable, Logger } from '@nestjs/common';
import { ITransaction, zeroX } from '@taraxa_project/explorer-shared';
import _ from 'lodash';
import { ChainState } from 'src/types/chainState';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';
import TransactionService from '../transaction/transaction.service';
import { BigInteger } from 'jsbn';
import { IGQLPBFT } from 'src/types';
import { GraphQLConnectorService, RPCConnectorService } from '../connectors';
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
    private readonly graphQLConnector: GraphQLConnectorService,
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
    const blockNumber = (
      await this.graphQLConnector.getPBFTBlockNumberAndParentForHash()
    )?.number;
    const dagBlock = await this.graphQLConnector.getDagBlockByHash();

    const genesis = (
      await this.graphQLConnector.getPBFTBlocksByNumberFromTo(0, 0)
    )[0];
    const block = (
      await this.graphQLConnector.getPBFTBlocksByNumberFromTo(
        blockNumber,
        blockNumber
      )
    )[0];

    this.chainState = {
      number: block.number,
      hash: block.hash,
      genesis: genesis.hash,
      dagBlockLevel: dagBlock?.level,
      dagBlockPeriod: dagBlock?.pbftPeriod,
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

    // if genesis block changes or the chain has lesser blocks than the syncer state(reset happened), resync
    if (
      !this.chainState.genesis ||
      zeroX(this.chainState.genesis) !== this.syncState.genesis ||
      (this.chainState.number < this.syncState.number &&
        this.chainState.hash?.toLowerCase() !==
          this.syncState.hash?.toLowerCase())
    ) {
      this.logger.log(
        'New genesis block hash or network reset detected. Restarting chain sync.'
      );
      console.log(
        'New genesis block hash or network reset detected. Restarting chain sync.'
      );
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
      const chainBlockAtSyncNumber = zeroX(
        (
          await this.graphQLConnector.getPBFTBlockHashForNumber(
            this.syncState.number
          )
        )?.hash
      );
      if (chainBlockAtSyncNumber !== this.syncState.hash) {
        console.log(
          'Block hash at height',
          this.syncState.number,
          'has changed. Re-org detected, walking back.'
        );
        this.logger.log(
          `Block hash at height ${this.syncState.number} has changed. Re-org detected, walking back.`
        );
        const lastBlock = await this.pbftService.getBlockByHash(
          this.syncState.hash
        );
        // go back a step
        this.syncState.number = Number(lastBlock?.number || 1) - 1; //if the last block comes as null
        this.syncState.hash = lastBlock?.parent
          ? lastBlock?.parent
          : zeroX(
              (await this.graphQLConnector.getPBFTBlockHashForNumber(0))?.hash
            ); //if the parent comes back as null jump to block zero
      } else {
        verifiedTip = true;
      }
    }

    // @note : Right now there is no way to get the genesis transactions to set:
    // Initial validators, initial balances for delegators and faucet.
    // big TODO

    while (this.syncState.number < this.chainState.number) {
      const blocksWithTransactions: IGQLPBFT[] =
        await this.graphQLConnector.getPBFTBlocksByNumberFromTo(
          this.syncState.number,
          this.chainState.number
        );

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
          console.log(`Finalized block ${savedBlock.hash}`);
          // Fetch and save each DAG block for the PBFT Period
          try {
            const dags = await this.graphQLConnector.getDagBlockForPbftPeriod(
              savedBlock.number
            );
            for (const dag of dags) {
              const formattedDag = this.dagService.dagGraphQlToIdag(dag);
              await this.dagService.safeSaveDag(formattedDag);
            }
          } catch (error) {
            this.logger.error(
              `Saving DAGs for PBFT period ${savedBlock.number} failed. Reason: `,
              error
            );
            console.error(
              `Saving DAGs for PBFT period ${savedBlock.number} failed. Reason: `,
              error
            );
          }
        }

        // update sync state
        await this.reSyncChainState();
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
}
