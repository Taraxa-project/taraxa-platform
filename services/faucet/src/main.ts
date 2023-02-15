import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Taraxa Faucet')
    .setDescription('Taraxa Faucet')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('apidocs', app, document);
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Type', 'Content-Range'],
  });
  const adapter = app.getHttpAdapter().getInstance();
  adapter.set('trust proxy', 'loopback');
  await app.listen(process.env.SERVER_PORT || 3002);
}
bootstrap();
