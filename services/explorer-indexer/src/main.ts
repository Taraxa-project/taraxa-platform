import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import helmet from 'helmet';

export function getPort(): number {
  return parseInt(process.env.PORT || process.env.SERVER_PORT || '3000', 10);
}

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const PORT = getPort();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableShutdownHooks();
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Type', 'Content-Range'],
  });
  app.use(helmet());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(PORT);
  logger.log(`Application listening on port ${PORT}`);
}
bootstrap();
