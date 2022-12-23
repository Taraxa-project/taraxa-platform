import { Logger } from '@nestjs/common';
import { Queue } from 'bull';

export default class QueuePopulatorCache {
  private readonly logger: Logger = new Logger(QueuePopulatorCache.name);
  private cache: any[] = [];
  private cacheLimit: number;

  constructor(private readonly queue: Queue, cacheLimit: number) {
    this.cacheLimit = cacheLimit;
    this.logger.debug(`Initialized Queue Cache for Queue ${queue.name}`);
  }

  private async sendMessages() {
    try {
      const added = await this.queue.addBulk(this.cache);
      if (added) {
        this.logger.log(
          `Sent ${this.cache.length} number of messages to ${this.queue.name}`
        );
        this.cache.length = 0;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async clearCache() {
    await this.sendMessages();
    this.logger.debug(`Emptied cache for queue ${this.queue.name}.`);
    this.cache.length = 0;
  }

  public async add(data: any, message?: string) {
    this.cache.push(data);
    if (this.cache.length === this.cacheLimit) {
      await this.sendMessages();
      if (message) {
        this.logger.log(message);
      }
    }
  }

  public async addBulk(data: any[], message?: string) {
    this.cache = this.cache.concat(data);
    if (this.cache.length === this.cacheLimit) {
      await this.sendMessages();
      if (message) {
        this.logger.log(message);
      }
    }
  }
}
