import { BlockchainService } from '@faucet/blockchain';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import { AppModule, entities } from '../src/app.module';
import { RequestEntity } from '../src/modules/faucet/entity';
import { FaucetService } from '../src/modules/faucet/faucet.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../.env' });

const testLogger = new Logger('e2e');

export const bootstrapTestInstance: any = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) ?? 5432,
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_TEST_DATABASE ?? 'faucet_test',
        entities,
        dropSchema: true,
        synchronize: true,
      }),
      TypeOrmModule.forFeature([RequestEntity]),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const faucetService = await app.resolve<FaucetService>(FaucetService);
  const blockchainService = await app.resolve<BlockchainService>(
    BlockchainService
  );
  const configService = await app.resolve<ConfigService>(ConfigService);

  app.useLogger(testLogger);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return {
    faucetService,
    blockchainService,
    configService,
    app,
  };
};
