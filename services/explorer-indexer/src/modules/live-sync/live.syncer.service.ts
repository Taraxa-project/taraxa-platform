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
  NewPbftBlockHeaderResponse,
  QueueData,
  QueueJobs,
  ResponseTypes,
  SyncTypes,
  toObject,
  Topics,
} from 'src/types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export default class LiveSyncerService {
  private readonly logger: Logger = new Logger(LiveSyncerService.name);
  private isWsConnected: boolean;
  constructor(
    @InjectWebSocketProvider()
    private ws: WebSocketClient,
    @InjectQueue('new_pbfts')
    private readonly pbftsQueue: Queue,
    private readonly configService: ConfigService
  ) {
    this.logger.log('Starting NodeSyncronizer');
    this.isWsConnected = false;
  }

  public getWsState() {
    return this.isWsConnected;
  }

  @EventListener('open')
  async onOpen() {
    this.logger.log(
      `Connected to WS server at ${this.ws.url}. Blockchain sync started.`
    );

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
  onMessage(data: WebSocketClient.Data) {
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
          this.pbftsQueue.add(QueueJobs.NEW_PBFT_BLOCKS, {
            pbftPeriod: formattedNumber,
            type: SyncTypes.LIVE,
          } as QueueData);
          this.logger.debug(`Pushed ${formattedNumber} into PBFT sync queue`);
      }
    } catch (error) {
      this.logger.error(`Could not persist incoming data. Cause: ${error}`);
    }
  }
}
