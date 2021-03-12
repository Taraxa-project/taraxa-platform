import { Module } from '@nestjs/common';
import { BlockchainModule } from '@taraxa-claim/blockchain';
import { ClaimModule } from '@taraxa-claim/claim';
import { ScannerService } from './scanner.service';

@Module({
  imports: [BlockchainModule, ClaimModule],
  providers: [ScannerService],
})
export class ScannerModule {}
