import { Module } from '@nestjs/common';
import { AuthModule } from '@taraxa-claim/auth';
import { ClaimModule } from '@taraxa-claim/claim';
import { GeneralModule } from './general.module';

@Module({
  imports: [GeneralModule, AuthModule, ClaimModule.forRoot()],
})
export class AppModule {}
