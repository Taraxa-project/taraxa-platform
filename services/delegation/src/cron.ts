import { NestFactory } from '@nestjs/core';
import { AppCoreModule } from './modules/app-core.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    AppCoreModule.forRoot('cron'),
  );
  await app.close();
}
bootstrap();
