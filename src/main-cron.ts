import { NestFactory } from '@nestjs/core';
import { CronModule } from './cron.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(CronModule, {
    logger: ['error', 'warn'],
  });
}
bootstrap();
