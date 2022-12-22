import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { zeroX } from '@taraxa_project/explorer-shared';
import _, { add } from 'lodash';
import { ChainState } from 'src/types/chainState';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';
import TransactionService from '../transaction/transaction.service';
import { GraphQLConnectorService } from '../connectors';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueData, QueueJobs, SyncTypes } from '../../types';
@Injectable()
export default class HistoricalSyncService implements OnModuleInit {
  private readonly logger: Logger = new Logger(HistoricalSyncService.name);
  private isRunning = false;
  private chainState = {} as ChainState;
  private syncState = {} as ChainState;
  constructor(
    private readonly dagService: DagService,
    private readonly pbftService: PbftService,
    private readonly txService: TransactionService,
    private readonly graphQLConnector: GraphQLConnectorService,
    private readonly configService: ConfigService,
    @InjectQueue('new_pbfts')
    private readonly pbftsQueue: Queue,
    @InjectQueue('new_dags')
    private readonly dagsQueue: Queue
  ) {
    this.logger.log('Historical syncer started.');
  }
  onModuleInit() {
    const isProducer = this.configService.get<boolean>('general.isProducer');
    if (isProducer) {
      this.pbftsQueue.empty();
      this.dagsQueue.empty();
    }
    this.runHistoricalSync();
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
      hash: zeroX(block.hash),
      genesis: zeroX(genesis.hash),
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

  private async pushChunksBulk(
    chunks: { name: QueueJobs; data: { pbftPeriod: number } }[],
    message: string
  ) {
    try {
      const added = await this.pbftsQueue.addBulk(chunks);
      if (added) {
        this.logger.log(message);
        chunks.length = 0;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Syncs the missing chain history to the explorer's database using the new Taraxa Node GraphQL inteface.
   * @returns void
   */
  public async runHistoricalSync(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logger.log('Historical sync started');
    //reset state
    await this.reSyncChainState();
    await this.reSyncCurrentState();

    let verifiedTip = false;

    const reorgThreshold =
      this.configService.get<number>('general.reorgThreshold') || 100;
    // if genesis block changes or the chain has lesser blocks than the syncer state(reset happened), resync
    const isGenesys = this.chainState.genesis;
    const genesysNotMatching =
      this.chainState.genesis.toLowerCase() !==
      this.syncState.genesis.toLowerCase();
    const reorgDetected =
      this.chainState.number < this.syncState.number - reorgThreshold;
    if (
      !isGenesys || //there is no genesys
      genesysNotMatching || // genesys hash is different
      reorgDetected // there has been a network reset not just a tip reformation
    ) {
      this.logger.warn(
        `${isGenesys && 'No genesis block hash'}
             ${genesysNotMatching && 'New genesis block hash'}
            ${
              reorgDetected && ', Network reset'
            } detected. Restarting chain sync.`
      );
      // reset the database and remove the queue entries
      await this.txService.clearTransactionData();
      this.logger.warn('Cleared Transaction table');
      await this.dagService.clearDagData();
      this.logger.warn('Cleared DAG table');
      await this.pbftService.clearPbftData();
      this.logger.warn('Cleared PBFT table');
      await this.pbftsQueue.empty();
      this.logger.warn('Cleared PBFT queue');
      await this.dagsQueue.empty();
      this.logger.warn('Cleared DAG queue');
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
      const chainBlockHashAtSyncNumber = zeroX(
        (
          await this.graphQLConnector.getPBFTBlockHashForNumber(
            this.syncState.number
          )
        )?.hash
      );
      if (chainBlockHashAtSyncNumber !== this.syncState.hash) {
        this.logger.warn(
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
    const chunks = [
      {
        name: QueueJobs.NEW_PBFT_BLOCKS,
        data: {
          pbftPeriod: 0,
        },
      },
    ];
    const missingBlockNumbers = await this.pbftService.getMissingPbftPeriods();

    for (const blockNumber of missingBlockNumbers) {
      chunks.push({
        name: QueueJobs.NEW_PBFT_BLOCKS,
        data: {
          pbftPeriod: blockNumber,
          type: SyncTypes.HISTORICAL,
        } as QueueData,
      });
      if (chunks.length === 1000) {
        await this.pushChunksBulk(
          chunks,
          `Added periods ${chunks[0].data.pbftPeriod} to ${
            chunks[chunks.length - 1].data.pbftPeriod
          } to the PBFTs queue from between the first and last saved block number in the database`
        );
      }
    }
    for (
      this.syncState.number;
      this.syncState.number < this.chainState.number;
      this.syncState.number++
    ) {
      if (chunks.length === 1000) {
        await this.pushChunksBulk(
          chunks,
          `Added ${chunks.length} PBFT periods in Queue up until ${
            chunks[chunks.length - 1].data.pbftPeriod
          }`
        );
      }
      chunks.push({
        name: QueueJobs.NEW_PBFT_BLOCKS,
        data: {
          pbftPeriod: this.syncState.number,
          type: SyncTypes.HISTORICAL,
        } as QueueData,
      });
    }
    await this.pushChunksBulk(
      chunks,
      `Added ${chunks.length} PBFT periods in Queue up until ${
        chunks[chunks.length - 1].data.pbftPeriod
      }`
    );
  }
}
