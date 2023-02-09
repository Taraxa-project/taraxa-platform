import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InjectWebSocketProvider,
  WebSocketClient,
  EventListener,
  OnMessage,
  createWebSocket,
} from '@0xelod/nestjs-websocket';
import {
  checkType,
  JobKeepAliveConfiguration,
  NewPbftBlockHeaderResponse,
  QueueData,
  QueueJobs,
  Queues,
  ResponseTypes,
  SyncTypes,
  toObject,
  Topics,
} from 'src/types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GraphQLConnectorService } from '../connectors';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';
import TransactionService from '../transaction/transaction.service';
import { deZeroX } from '@taraxa_project/explorer-shared';
import HistoricalSyncService from '../historical-sync/historical.syncer.service';
import { QueuePopulatorCache } from '../common';

@Injectable()
export default class LiveSyncerService {
  private readonly logger: Logger = new Logger(LiveSyncerService.name);
  private isWsConnected: boolean;
  private queueCache: QueuePopulatorCache;
  constructor(
    @InjectWebSocketProvider()
    private ws: WebSocketClient,
    @InjectQueue(Queues.NEW_PBFTS)
    private readonly pbftsQueue: Queue,
    @InjectQueue(Queues.NEW_DAGS)
    private readonly dagsQueue: Queue,
    private readonly configService: ConfigService,
    private readonly dagService: DagService,
    private readonly pbftService: PbftService,
    private readonly txService: TransactionService,
    private readonly graphQLConnector: GraphQLConnectorService,
    private readonly historicalSyncerService: HistoricalSyncService
  ) {
    this.logger.log('Starting NodeSyncronizer');
    this.isWsConnected = false;
    this.queueCache = new QueuePopulatorCache(this.pbftsQueue, 10);
  }

  public getWsState() {
    return this.isWsConnected;
  }

  @EventListener('open')
  async onOpen() {
    this.logger.log(
      `Connected to WS server at ${this.ws.url}. Blockchain sync started.`
    );
    const storedGenesis = await this.pbftService.getBlockByNumber(0);
    const chainGenesis = (
      await this.graphQLConnector.getPBFTBlocksByNumberFromTo(0, 0)
    )[0];
    if (
      storedGenesis &&
      chainGenesis &&
      deZeroX(storedGenesis.hash?.toLowerCase()) !==
        deZeroX(chainGenesis.hash?.toLowerCase())
    ) {
      this.logger.warn(
        `Stored genesis hash is ${deZeroX(storedGenesis.hash?.toLowerCase())}`
      );
      this.logger.warn(
        `Chain genesis hash is ${deZeroX(chainGenesis.hash?.toLowerCase())}`
      );
      this.logger.warn('New genesis block hash detected. Wiping database.');
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
    }
    if (this.ws.readyState === this.ws.OPEN && !this.isWsConnected) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 0,
          method: 'eth_subscribe',
          params: [Topics.NEW_HEADS],
        }),
        (err: Error) => {
          if (err) this.logger.error(err);
        }
      );
      this.logger.warn(
        `Subscribed to eth_subscription method ${Topics.NEW_HEADS}`
      );
      this.isWsConnected = true;
    }
  }

  @EventListener('close')
  async onClose(code: number) {
    this.logger.error(
      `Server at ${this.ws.url} disconnected with code ${code}`
    );
    this.isWsConnected = false;
    setTimeout(async () => {
      const newConnection = await createWebSocket({
        url: this.ws.url,
      });
      if (
        newConnection &&
        (newConnection.readyState === newConnection.OPEN ||
          newConnection.readyState === newConnection.CONNECTING)
      ) {
        this.logger.log(
          `New Ws connection established at ${newConnection.url}`
        );
        this.ws = newConnection;
        this.ws.on('open', () => this.onOpen());
        this.ws.on('message', (data) => this.onMessage(data));
        this.ws.on('close', (code) => this.onClose(code));
        this.ws.on('error', () => this.onError());
        this.ws.on('ping', (data) => this.onPing(data));
        this.ws.on('pong', (data) => this.onPong(data));
      } else {
        this.logger.log(
          `New Ws connection establisment failed at ${newConnection.url}`
        );
      }
    }, this.configService.get<number>('general.wsReconnectInterval') || 3000);
  }

  @EventListener('ping')
  onPing(data: Buffer) {
    const pingJson = data.toJSON();
    this.logger.log(`PING ${this.ws.url} >>> ${pingJson}`);
  }

  @EventListener('pong')
  onPong(data: Buffer) {
    const pongJson = data.toJSON();
    this.logger.log(`PONG ${this.ws.url} >>> ${pongJson}`);
  }

  @EventListener('error')
  onError() {
    this.logger.error(`WS error from ${this.ws.url}`);
  }

  @OnMessage()
  async onMessage(data: WebSocketClient.Data) {
    const parsedData = toObject(
      data,
      (msg: string) => this.logger.warn(msg),
      this.logger
    );
    const type = checkType(parsedData);
    try {
      switch (type) {
        case ResponseTypes.NewHeadsReponse:
          const { number } = parsedData.result as NewPbftBlockHeaderResponse;
          const formattedNumber = parseInt(number, 16);
          if (this.historicalSyncerService.isRunning) {
            await this.queueCache.add({
              data: {
                pbftPeriod: formattedNumber,
                type: SyncTypes.LIVE,
              } as QueueData,
              JobKeepAliveConfiguration,
            });
            this.logger.debug(`Pushed ${formattedNumber} into PBFT sync cache`);
          } else {
            await this.queueCache.clearCache();
            await this.pbftsQueue.add(
              {
                pbftPeriod: formattedNumber,
                type: SyncTypes.LIVE,
              } as QueueData,
              JobKeepAliveConfiguration
            );
            this.logger.debug(`Pushed ${formattedNumber} into PBFT sync queue`);
          }
      }
    } catch (error) {
      this.logger.error(`Could not persist incoming data. Cause: ${error}`);
    }
  }
}
