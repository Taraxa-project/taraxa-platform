import { Queue } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { NODE_CREATED_EVENT } from '../../node/node.constants';
import { NodeCreatedEvent } from '../../node/event/node-created.event';
import { NodeType } from '../../node/node-type.enum';
import { ENSURE_DELEGATION_JOB } from '../delegation.constants';
import { EnsureDelegationJob } from '../job/ensure-delegation.job';

@Injectable()
export class NodeCreatedListener {
  private readonly logger = new Logger(NodeCreatedListener.name);
  constructor(
    @InjectQueue('delegation')
    private delegationQueue: Queue,
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

    if (event.type === NodeType.MAINNET) {
      this.logger.debug(
        `${NODE_CREATED_EVENT} event: Skipping, node ${event.nodeId} is a mainnet node`,
      );
      return;
    }

    await this.delegationQueue.add(
      ENSURE_DELEGATION_JOB,
      new EnsureDelegationJob(event.nodeId, event.type, event.address),
    );
  }
}
