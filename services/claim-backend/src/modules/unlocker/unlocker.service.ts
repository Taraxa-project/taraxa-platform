import { CronJob } from 'cron';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { general } from '@taraxa-claim/config';
import { ClaimService } from '@taraxa-claim/claim';

@Injectable()
export class UnlockerService implements OnModuleInit {
  private readonly logger = new Logger(UnlockerService.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private claimService: ClaimService,
    @Inject(general.KEY)
    private readonly generalConfig: ConfigType<typeof general>,
  ) {}
  onModuleInit() {
    const cronJob = () => {
      this.handleCron();
    };

    const c = new CronJob(this.generalConfig.unlockerInterval, cronJob);
    this.schedulerRegistry.addCronJob(UnlockerService.name, c);
    c.start();
  }

  async handleCron() {
    try {
      this.logger.log('Starting Unlocker Service');
      await this.claimService.unlockRewards();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
