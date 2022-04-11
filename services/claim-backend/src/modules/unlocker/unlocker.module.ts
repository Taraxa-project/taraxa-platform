import { Module } from '@nestjs/common';
import { ClaimModule } from '@taraxa-claim/claim';
import { UnlockerService } from './unlocker.service';

@Module({
  imports: [ClaimModule],
  providers: [UnlockerService],
})
export class UnlockerModule {}
