import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NODE_DELETED_EVENT } from '../node.constants';
import { NodeDeletedEvent } from '../event/node-deleted.event';
import { NodeType } from '../node-type.enum';

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

    if (event.type === NodeType.MAINNET) {
      this.logger.debug(
        `${NODE_DELETED_EVENT} event: Skipping, node ${event.nodeId} is a mainnet node`,
      );
      return;
    }
  }
}
