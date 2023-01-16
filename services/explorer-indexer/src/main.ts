import expressBasicAuth from 'express-basic-auth';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeBullBoard } from './bullBoard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'prod'
        ? ['log', 'error', 'warn']
        : ['log', 'debug', 'error', 'verbose', 'warn'],
  });

  if (process.env.NODE_ENV !== 'prod') {
    const serverAdapterRouter = initializeBullBoard(app);
    app.use(
      '/bull-board',
      expressBasicAuth({
        users: {
          user: 'password',
        },
        challenge: true,
      }),
      serverAdapterRouter
    );
  }
  await app.listen(process.env.SERVER_PORT || 3040);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
