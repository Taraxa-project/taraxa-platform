import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  if (!configService.get<boolean>('isProd')) {
    const swagger = new DocumentBuilder()
      .setTitle('delegation')
      .setDescription('Taraxa Delegation Service')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swagger);

    SwaggerModule.setup('apidocs', app, document);
  }

  await app.listen(configService.get<number>('port'));
}
bootstrap();
