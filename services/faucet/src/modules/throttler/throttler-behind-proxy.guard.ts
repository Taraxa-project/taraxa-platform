import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  private readonly logger = new Logger(ThrottlerBehindProxyGuard.name);
  protected getTracker(req: Request): string {
    this.logger.debug(`ip: ${req.ip}`);
    this.logger.debug(`ips:`);
    this.logger.debug(req.ips);

    this.logger.debug(`headers:`);
    this.logger.debug(req.headers);

    const fwdIp = req.headers['x-forwarded-for'];
    const ip = req.ips.length ? req.ips[0] : req.ip;
    let realIp = fwdIp || ip;
    realIp = typeof realIp === 'string' ? realIp : realIp[0];

    this.logger.debug(`ip: ${realIp}`);
    return realIp;
  }
}
