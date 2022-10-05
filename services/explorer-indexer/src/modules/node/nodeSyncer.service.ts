import { Injectable, Logger } from '@nestjs/common';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';
import {
  InjectWebSocketProvider,
  WebSocketClient,
  EventListener,
  OnMessage,
} from 'nestjs-websocket';
import util from 'util';
import {
  checkType,
  NewDagBlockFinalizedResponse,
  NewDagBlockResponse,
  NewPbftBlockResponse,
  ResponseTypes,
  toObject,
} from 'src/types';

export enum Topics {
  NEW_DAG_BLOCKS = 'newDagBlocks', // @note fired when a DAG block is accepted by the consensus
  NEW_DAG_BLOCKS_FINALIZED = 'newDagBlocksFinalized', // @note fired when a DAG block is inserted into a PBFT block
  NEW_PBFT_BLOCKS = 'newPbftBlocks', // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = 'newHeads', // @note fired when a PBFT ns "mined": all transactions inside it were executed
  ERRORS = 'error', // @note error message
}

export enum Subscriptions {
  NEW_DAG_BLOCKS = 1, // @note fired when a DAG block is accepted by the consensus
  NEW_DAG_BLOCKS_FINALIZED = 2, // @note fired when a DAG block is inserted into a PBFT block
  NEW_PBFT_BLOCKS = 3, // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = 4, // @note fired when a PBFT ns "mined": all transactions inside it were executed
}

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
      `Subscribet to eth_subscription method ${Topics.NEW_DAG_BLOCKS}`
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
      `Subscribet to eth_subscription method ${Topics.NEW_DAG_BLOCKS_FINALIZED}`
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
      `Subscribet to eth_subscription method ${Topics.NEW_PBFT_BLOCKS}`
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
      `Subscribet to eth_subscription method ${Topics.NEW_HEADS}`
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
    const j = data.toJSON();
    this.logger.log(`PING ${this.ws.url} >>> ${j}`);
  }

  @EventListener('pong')
  onPong(data: Buffer) {
    const j = data.toJSON();
    this.logger.log(`PONG ${this.ws.url} >>> ${j}`);
  }

  @EventListener('error')
  onError() {
    this.logger.error(`WS error from ${this.ws.url}`);
  }

  @OnMessage()
  message(data: WebSocketClient.Data) {
    this.logger.log(
      `Data received: ${util.inspect(JSON.parse(data.toString()))}`
    );
    const parsedData = toObject(
      data,
      (msg: string) => this.logger.warn(msg),
      this.logger
    );
    const type = checkType(parsedData);
    switch (type) {
      case ResponseTypes.NewDagBlockFinalizedResponse:
        this.dagService.updateDag(
          parsedData.result as NewDagBlockFinalizedResponse
        );
      case ResponseTypes.NewDagBlockResponse:
        this.dagService.handleNewDag(parsedData.result as NewDagBlockResponse);
      case ResponseTypes.NewPbftBlockResponse:
        this.pbftService.handleNewPbft(
          parsedData.result as NewPbftBlockResponse
        );
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
