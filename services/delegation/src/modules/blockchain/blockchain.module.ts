import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';

import delegationConfig from '../../config/delegation';
import ethereumConfig from '../../config/ethereum';

import {
  BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
  BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
} from './blockchain.constant';
import { BlockchainService } from './blockchain.service';

const getProviders = () => [
  {
    provide: BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
    useFactory: (
      delegation: ConfigType<typeof delegationConfig>,
      ethereum: ConfigType<typeof ethereumConfig>,
    ) => {
      return BlockchainService.create(
        ethereum.testnetEndpoint,
        ethereum.testnetWallet,
        delegation.testnetDelegation,
        delegation.testnetOwnNodes,
        10000,
      );
    },
    inject: [delegationConfig.KEY, ethereumConfig.KEY],
  },
  {
    provide: BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
    useFactory: (
      delegation: ConfigType<typeof delegationConfig>,
      ethereum: ConfigType<typeof ethereumConfig>,
    ) => {
      return BlockchainService.create(
        ethereum.mainnetEndpoint,
        ethereum.mainnetWallet,
        delegation.minDelegation,
        [],
        0,
      );
    },
    inject: [delegationConfig.KEY, ethereumConfig.KEY],
  },
];

@Module({
  imports: [
    ConfigModule.forFeature(delegationConfig),
    ConfigModule.forFeature(ethereumConfig),
  ],
  providers: getProviders(),
  exports: getProviders(),
})
export class BlockchainModule {}
