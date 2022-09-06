import { BlockchainModule } from '@faucet/blockchain';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './entity';
import { FaucetController } from './faucet.controller';
import { FaucetService } from './faucet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    BlockchainModule,
  ],
  controllers: [FaucetController],
  providers: [FaucetService],
  exports: [FaucetService],
})
export class FaucetModule {}
