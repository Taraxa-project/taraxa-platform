import { Module } from '@nestjs/common';
import { BlockchainModule } from '@taraxa-claim/blockchain';
import { ScannerService } from './scanner.service';

@Module({
  imports: [BlockchainModule],
  providers: [ScannerService],
})
export class ScannerModule {}
