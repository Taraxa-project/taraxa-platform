import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NODE_DELETED_EVENT } from '../node.constants';
import { NodeDeletedEvent } from '../event/node-deleted.event';

@Injectable()
export class NodeDeletedListener {
  private readonly logger = new Logger(NodeDeletedListener.name);
  @OnEvent(NODE_DELETED_EVENT, { async: true })
  async handleNodeDeletedEvent(event: NodeDeletedEvent) {
    this.logger.debug(
      `Received ${NODE_DELETED_EVENT} event, data: ${JSON.stringify(
        event,
        null,
        2,
      )}`,
    );
  }
}
