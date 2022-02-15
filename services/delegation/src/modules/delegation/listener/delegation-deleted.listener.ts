import { Queue } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DELEGATION_DELETED_EVENT,
  ENSURE_DELEGATION_JOB,
} from '../delegation.constants';
import { DelegationService } from '../delegation.service';
import { DelegationDeletedEvent } from '../event/delegation-deleted.event';
import { EnsureDelegationJob } from '../job/ensure-delegation.job';

@Injectable()
export class DelegationDeletedListener {
  private readonly logger = new Logger(DelegationDeletedListener.name);
  constructor(
    @InjectQueue('delegation')
    private delegationQueue: Queue,
    private delegationService: DelegationService,
  ) {}
  @OnEvent(DELEGATION_DELETED_EVENT, { async: true })
  async handleDelegationDeletedEvent(event: DelegationDeletedEvent) {
    this.logger.debug(
      `Received ${DELEGATION_DELETED_EVENT} event, data: ${JSON.stringify(
        event,
        null,
        2,
      )}`,
    );

    const delegation = await this.delegationService.findDelegationByOrFail(
      {
        id: event.delegationId,
      },
      {
        withDeleted: true,
        relations: ['node'],
      },
    );

    await this.delegationQueue.add(
      ENSURE_DELEGATION_JOB,
      new EnsureDelegationJob(
        delegation.node.id,
        delegation.node.type,
        delegation.node.address,
      ),
    );
  }
}
