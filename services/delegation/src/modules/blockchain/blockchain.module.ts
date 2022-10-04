import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import delegationConfig from '../../config/delegation';
import ethereumConfig from '../../config/ethereum';

import { BlockchainService } from './blockchain.service';

@Module({
  imports: [
    ConfigModule.forFeature(delegationConfig),
    ConfigModule.forFeature(ethereumConfig),
  ],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
