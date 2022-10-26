import { Injectable, Logger } from '@nestjs/common';
import {
  InjectWebSocketProvider,
  WebSocketClient,
  EventListener,
  OnMessage,
} from 'nestjs-websocket';
import {
  checkType,
  NewDagBlockFinalizedResponse,
  NewDagBlockResponse,
  NewPbftBlockHeaderResponse,
  NewPbftBlockResponse,
  QueueJobs,
  ResponseTypes,
  toObject,
  Topics,
} from 'src/types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export default class LiveSyncerService {
  private readonly logger: Logger = new Logger(LiveSyncerService.name);
  constructor(
    @InjectWebSocketProvider()
    private readonly ws: WebSocketClient,
    @InjectQueue('new_pbfts')
    private readonly pbftsQueue: Queue
  ) {
    this.logger.log('Starting NodeSyncronizer');
  }

  @EventListener('open')
  async onOpen() {
    this.logger.log(
      `Connected to WS server at ${this.ws.url}. Blockchain sync started.`
    );

    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'eth_subscribe',
        params: [Topics.NEW_DAG_BLOCKS],
      }),
      (err: Error) => {
        if (err) this.logger.error(err);
      }
    );
    this.logger.warn(
      `Subscribed to eth_subscription method ${Topics.NEW_DAG_BLOCKS}`
    );
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'eth_subscribe',
        params: [Topics.NEW_DAG_BLOCKS_FINALIZED],
      }),
      (err: Error) => {
        if (err) this.logger.error(err);
      }
    );
    this.logger.warn(
      `Subscribed to eth_subscription method ${Topics.NEW_DAG_BLOCKS_FINALIZED}`
    );
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'eth_subscribe',
        params: [Topics.NEW_PBFT_BLOCKS],
      }),
      (err: Error) => {
        if (err) this.logger.error(err);
      }
    );
    this.logger.warn(
      `Subscribed to eth_subscription method ${Topics.NEW_PBFT_BLOCKS}`
    );

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
  }

  @EventListener('close')
  onClose(code: number) {
    this.logger.error(
      `Server at ${this.ws.url} disconnected with code ${code}`
    );
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
  message(data: WebSocketClient.Data) {
    const parsedData = toObject(
      data,
      (msg: string) => this.logger.warn(msg),
      this.logger
    );
    const type = checkType(parsedData);
    try {
      switch (type) {
        // case ResponseTypes.NewDagBlockFinalizedResponse:
        //   this.liveSyncQueue.add(
        //     Topics.NEW_DAG_BLOCKS,
        //     parsedData.result as NewDagBlockFinalizedResponse
        //   );
        //   // this.dagService.updateDag(
        //   //   parsedData.result as NewDagBlockFinalizedResponse
        //   // );
        //   break;
        // case ResponseTypes.NewDagBlockResponse:
        //   this.liveSyncQueue.add(
        //     Topics.NEW_DAG_BLOCKS_FINALIZED,
        //     parsedData.result as NewDagBlockResponse
        //   );
        //   // this.dagService.handleNewDag(
        //   //   parsedData.result as NewDagBlockResponse
        //   // );
        //   break;
        // case ResponseTypes.NewPbftBlockResponse:
        //   this.pbftsQueue.add(
        //     // Topics.NEW_PBFT_BLOCKS,
        //     QueueJobs.NEW_PBFT_BLOCKS,
        //     parsedData.result as NewPbftBlockResponse
        //   );
        //   // this.pbftService.handleNewPbft(
        //   //   parsedData.result as NewPbftBlockResponse
        //   // );
        //   break;
        case ResponseTypes.NewHeadsReponse:
          const { number } = parsedData.result as NewPbftBlockHeaderResponse;
          const formattedNumber = parseInt(number, 16);
          this.pbftsQueue.add(QueueJobs.NEW_PBFT_BLOCKS, formattedNumber);
          // this.pbftService.handleNewPbftHeads(
          //   parsedData.result as NewPbftBlockHeaderResponse
          // );
          break;
        // case ResponseTypes.NewPendingTransactions:
        //   this,
        //     this.liveSyncQueue.add(Topics.NEW_PENDING_TRANSACTIONS, {
        //       hash: parsedData.result as string,
        //     });
        //   // this.txService.safeSaveEmptyTx({ hash: parsedData.result as string });
        //   break;
      }
    } catch (error) {
      this.logger.error(`Could not persist incoming data. Cause: ${error}`);
    }
  }
}
