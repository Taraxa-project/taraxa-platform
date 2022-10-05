import { Injectable, Logger, UseFilters } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { IDAG, IPBFT } from '@taraxa_project/taraxa-models';
import DagService from './modules/dag/dag.service';
import PbftService from './modules/pbft/pbft.service';
import { AllExceptionsFilter } from './WsExceptionFilter';

export enum Topics {
  NEW_DAG_BLOCKS = 'newDagBlocks', // @note fired when a DAG block is accepted by the consensus
  NEW_DAG_BLOCKS_FINALIZED = 'newDagBlocksFinalized', // @note fired when a DAG block is inserted into a PBFT block
  NEW_PBFT_BLOCKS = 'newPbftBlocks', // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = 'newHeads', // @note fired when a PBFT ns "mined": all transactions inside it were executed
  ERRORS = 'error', // @note error message
}

@UseFilters(new AllExceptionsFilter())
@WebSocketGateway(80, {
  cors: {
    origin: '*',
  },
})
@Injectable()
export default class NodeSyncronizer implements OnGatewayInit {
  private readonly logger: Logger = new Logger(NodeSyncronizer.name);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private readonly dagService: DagService,
    private readonly pbftService: PbftService
  ) {
    this.logger.log('Starting NodeSyncronizer');
  }
  afterInit(server: Server) {
    if (server) {
      this.logger.log('Connected to WS server');
    } else {
      this.logger.error('Server not connected successfully:', server);
    }
  }

  @SubscribeMessage(Topics.ERRORS)
  handleErrors(@MessageBody() data: string): void {
    this.logger.error(JSON.parse(data));
  }

  @SubscribeMessage(Topics.NEW_DAG_BLOCKS)
  handleNewDagBlockCreation(@MessageBody() data: string): void {
    console.log(`handleNewDagBlockCreation: ${data}`);
    const dag = JSON.parse(data) as IDAG;
    this.logger.log(`NewDagBlock ${dag.hash}`);
    this.dagService.handleNewDag(dag);
  }

  @SubscribeMessage(Topics.NEW_DAG_BLOCKS_FINALIZED)
  handleNewDagBlockFinalization(@MessageBody() data: string): void {
    console.log(`handleNewDagBlockFinalization: ${data}`);
    const dag = JSON.parse(data) as IDAG;
    this.logger.log(`NewDagBlockFinalized ${dag.hash}`);
    this.dagService.handleNewDag(dag);
  }

  @SubscribeMessage(Topics.NEW_PBFT_BLOCKS)
  handleNewPbftBlock(@MessageBody() data: string): void {
    console.log(`handleNewPbftBlock: ${data}`);
    const pbft = JSON.parse(data) as IPBFT;
    this.logger.log(`NewPbftBlock ${pbft.hash}`);
    this.pbftService.handleNewPbft(pbft);
  }

  @SubscribeMessage(Topics.NEW_PBFT_BLOCKS)
  handleNewHeads(@MessageBody() data: string): void {
    console.log(`handleNewHeads: ${data}`);
    const pbft = JSON.parse(data) as IPBFT;
    this.logger.log(`NewPbftBlock ${pbft.hash}`);
    this.pbftService.handleNewPbft(pbft);
  }
}
