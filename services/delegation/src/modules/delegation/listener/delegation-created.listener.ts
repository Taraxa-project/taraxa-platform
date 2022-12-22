import { Queue } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { OnEvent } from "@nestjs/event-emitter";
import {
  DELEGATION_CREATED_EVENT,
  ENSURE_DELEGATION_JOB,
} from "../delegation.constants";
import { DelegationService } from "../delegation.service";
import { DelegationCreatedEvent } from "../event/delegation-created.event";
import { EnsureDelegationJob } from "../job/ensure-delegation.job";

@Injectable()
export class DelegationCreatedListener {
  private readonly logger = new Logger(DelegationCreatedListener.name);
  constructor(
    @InjectQueue("delegation")
    private delegationQueue: Queue,
    private delegationService: DelegationService
  ) {}
  @OnEvent(DELEGATION_CREATED_EVENT, { async: true })
  async handleDelegationCreatedEvent(event: DelegationCreatedEvent) {
    this.logger.debug(
      `Received ${DELEGATION_CREATED_EVENT} event, data: ${JSON.stringify(
        event,
        null,
        2
      )}`
    );

    const delegation = await this.delegationService.findDelegationByOrFail(
      {
        id: event.delegationId,
      },
      {
        relations: ["node"],
      }
    );

    await this.delegationQueue.add(
      ENSURE_DELEGATION_JOB,
      new EnsureDelegationJob(
        delegation.node.id,
        delegation.node.type,
        delegation.node.address
      )
    );
  }
}
