import { Injectable, Logger } from '@nestjs/common';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';
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
  ResponseTypes,
  toObject,
  Topics,
} from 'src/types';

@Injectable()
export default class NodeSyncerService {
  private readonly logger: Logger = new Logger(NodeSyncerService.name);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    @InjectWebSocketProvider()
    private readonly ws: WebSocketClient,
    private readonly dagService: DagService,
    private readonly pbftService: PbftService
  ) {
    this.logger.log('Starting NodeSyncronizer');
  }

  @EventListener('open')
  onOpen() {
    this.logger.log(`Connected to WS server at ${this.ws.url}`);
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'eth_subscribe',
        params: [
          Topics.NEW_DAG_BLOCKS,
          //   Topics.NEW_DAG_BLOCKS_FINALIZED,
          // Topics.NEW_PBFT_BLOCKS,
          //   Topics.NEW_HEADS,
        ],
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
        params: [
          // Topics.NEW_DAG_BLOCKS,
          Topics.NEW_DAG_BLOCKS_FINALIZED,
          // Topics.NEW_PBFT_BLOCKS,
          //   Topics.NEW_HEADS,
        ],
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
        params: [
          //   Topics.NEW_DAG_BLOCKS,
          //   Topics.NEW_DAG_BLOCKS_FINALIZED,
          Topics.NEW_PBFT_BLOCKS,
          //   Topics.NEW_HEADS,
        ],
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
        params: [
          // Topics.NEW_DAG_BLOCKS,
          // Topics.NEW_DAG_BLOCKS_FINALIZED,
          // Topics.NEW_PBFT_BLOCKS,
          Topics.NEW_HEADS,
        ],
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
        case ResponseTypes.NewDagBlockFinalizedResponse:
          this.dagService.updateDag(
            parsedData.result as NewDagBlockFinalizedResponse
          );
          break;
        case ResponseTypes.NewDagBlockResponse:
          this.dagService.handleNewDag(
            parsedData.result as NewDagBlockResponse
          );
          break;
        case ResponseTypes.NewPbftBlockResponse:
          this.pbftService.handleNewPbft(
            parsedData.result as NewPbftBlockResponse
          );
          break;
        case ResponseTypes.NewHeadsReponse:
          this.pbftService.handleNewPbftHeads(
            parsedData.result as NewPbftBlockHeaderResponse
          );
          break;
      }
    } catch (error) {
      this.logger.error(`Could not persist incoming data. Cause: ${error}`);
    }
  }

  //   @SubscribeMessage(Topics.ERRORS)
  //   handleErrors(@MessageBody() data: string): void {
  //     this.logger.error(JSON.parse(data));
  //   }

  //   @SubscribeMessage(Topics.NEW_DAG_BLOCKS)
  //   handleNewDagBlockCreation(@MessageBody() data: string): void {
  //     console.log(`handleNewDagBlockCreation: ${data}`);
  //     const dag = JSON.parse(data) as IDAG;
  //     this.logger.log(`NewDagBlock ${dag.hash}`);
  //     this.dagService.handleNewDag(dag);
  //   }

  //   @SubscribeMessage(Topics.NEW_DAG_BLOCKS_FINALIZED)
  //   handleNewDagBlockFinalization(@MessageBody() data: string): void {
  //     console.log(`handleNewDagBlockFinalization: ${data}`);
  //     const dag = JSON.parse(data) as IDAG;
  //     this.logger.log(`NewDagBlockFinalized ${dag.hash}`);
  //     this.dagService.handleNewDag(dag);
  //   }

  //   @SubscribeMessage(Topics.NEW_PBFT_BLOCKS)
  //   handleNewPbftBlock(@MessageBody() data: string): void {
  //     console.log(`handleNewPbftBlock: ${data}`);
  //     const pbft = JSON.parse(data) as IPBFT;
  //     this.logger.log(`NewPbftBlock ${pbft.hash}`);
  //     this.pbftService.handleNewPbft(pbft);
  //   }

  //   @SubscribeMessage(Topics.NEW_PBFT_BLOCKS)
  //   handleNewHeads(@MessageBody() data: string): void {
  //     console.log(`handleNewHeads: ${data}`);
  //     const pbft = JSON.parse(data) as IPBFT;
  //     this.logger.log(`NewPbftBlock ${pbft.hash}`);
  //     this.pbftService.handleNewPbft(pbft);
  //   }
}
