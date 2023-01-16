import { Queue } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { OnEvent } from '@nestjs/event-emitter';
import { ENSURE_NODE_ONCHAIN_JOB, NODE_CREATED_EVENT } from '../node.constants';
import { NodeCreatedEvent } from '../event/node-created.event';
import { EnsureNodeOnchainJob } from '../job/ensure-node-onchain.job';

@Injectable()
export class NodeCreatedListener {
  private readonly logger = new Logger(NodeCreatedListener.name);
  constructor(
    @InjectQueue('node')
    private nodeQueue: Queue,
  ) {}
  @OnEvent(NODE_CREATED_EVENT, { async: true })
  async handleNodeCreatedEvent(event: NodeCreatedEvent) {
    this.logger.debug(
      `Received ${NODE_CREATED_EVENT} event, data: ${JSON.stringify(
        event,
        null,
        2,
      )}`,
    );

    await this.nodeQueue.add(
      ENSURE_NODE_ONCHAIN_JOB,
      new EnsureNodeOnchainJob(event.nodeId, event.type, event.address),
    );
  }
}
