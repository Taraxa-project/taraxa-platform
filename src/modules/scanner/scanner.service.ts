import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ethereum } from '@taraxa-claim/config'
import { BlockchainService, ContractTypes } from '@taraxa-claim/blockchain';

@Injectable()
export class ScannerService implements OnModuleInit {
  private readonly logger = new Logger(ScannerService.name);
  constructor(
    private readonly blockchainService: BlockchainService,
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>
  ) {}
  onModuleInit() {
    this.watchClaims();
  }

  private async watchClaims(): Promise<void> {
    this.logger.log('Started scanner');

    const claimContractInstance = this.blockchainService.getContractInstance(
      ContractTypes.CLAIM,
      this.ethereumConfig.claimContractAddress,
    );
    
    const filter = claimContractInstance.filters.Claimed();
    claimContractInstance.on(filter, async (address: string, nonce: number, value: number) => {
      this.logger.log(`New claim address: ${address} nonce: ${nonce} value: ${value}`);
    });
  }
}
