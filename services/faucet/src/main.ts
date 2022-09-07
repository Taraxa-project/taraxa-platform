import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Taraxa Faucet')
    .setDescription('Taraxa Faucet')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidocs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Type', 'Content-Range'],
  });
  await app.listen(process.env.SERVER_PORT || 3002);
}
bootstrap();
