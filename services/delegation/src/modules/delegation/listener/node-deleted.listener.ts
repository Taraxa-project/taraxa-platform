import { Queue } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { NODE_DELETED_EVENT } from '../../node/node.constants';
import { NodeType } from '../../node/node-type.enum';
import { NodeDeletedEvent } from '../../node/event/node-deleted.event';
import { ENSURE_DELEGATION_JOB } from '../delegation.constants';
import { EnsureDelegationJob } from '../job/ensure-delegation.job';

@Injectable()
export class NodeDeletedListener {
  private readonly logger = new Logger(NodeDeletedListener.name);
  constructor(
    @InjectQueue('delegation')
    private delegationQueue: Queue,
  ) {}
  @OnEvent(NODE_DELETED_EVENT, { async: true })
  async handleNodeDeletedEvent(event: NodeDeletedEvent) {
    this.logger.debug(
      `Received ${NODE_DELETED_EVENT} event, data: ${JSON.stringify(
        event,
        null,
        2,
      )}`,
    );

    if (event.type === NodeType.MAINNET) {
      this.logger.debug(
        `${NODE_DELETED_EVENT} event: Skipping, node ${event.nodeId} is a mainnet node`,
      );
      return;
    }

    await this.delegationQueue.add(
      ENSURE_DELEGATION_JOB,
      new EnsureDelegationJob(event.nodeId, event.type, event.address),
    );
  }
}
