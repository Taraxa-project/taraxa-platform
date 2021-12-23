import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import generalConfig from './config/general';

async function bootstrap() {
  const config = generalConfig();
  const app = await NestFactory.create(AppModule);

  if (!config.isProd) {
    const swagger = new DocumentBuilder()
      .setTitle('delegation')
      .setDescription('Taraxa Delegation Service')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swagger);

    SwaggerModule.setup('apidocs', app, document);
  }

  await app.listen(config.port);
}
bootstrap();
