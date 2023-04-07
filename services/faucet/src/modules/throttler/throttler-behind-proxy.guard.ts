import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  private readonly logger = new Logger(ThrottlerBehindProxyGuard.name);
  protected getTracker(req: Request): string {
    const ip =
      req.headers['x-forwarded-for'] || req.ips.length ? req.ips[0] : req.ip;

    this.logger.debug(`ip: ${ip}`);
    return ip;
  }
}
