import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClaimService } from '@taraxa-claim/claim';

@Injectable()
export class ClaimTaskService implements OnModuleInit {
  private readonly logger = new Logger(ClaimTaskService.name);
  constructor(private claimService: ClaimService) {}

  onModuleInit() {
    this.logger.debug(`Init ${ClaimService.name} cron`);
  }

  @Cron('0 0 * * *')
  async handleCron() {
    const claims = await this.claimService.getUnclaimedClaims();
    for (const claim of claims) {
      const { id, address } = claim;

      this.logger.log(`Checking claim ${id} for ${address}...`);
      this.logger.debug(claim);

      const isClaimed = await this.claimService.isClaimClaimed(claim);
      if (isClaimed) {
        this.logger.log(`Is claimed. Marking as claimed...`);
        await this.claimService.markAsClaimed(claim);
      } else {
        this.logger.log(`NOT claimed.`);
      }

      this.logger.log(`------------------------------`);
    }
  }
}
