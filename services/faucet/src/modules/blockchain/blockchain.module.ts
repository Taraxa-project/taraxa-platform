import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ethereum } from '@faucet/config';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [ConfigModule.forFeature(ethereum)],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
