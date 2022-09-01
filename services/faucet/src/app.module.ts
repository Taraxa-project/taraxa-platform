import { FaucetModule } from '@faucet/faucet';
import { Module } from '@nestjs/common';
import { GeneralModule } from './general.module';

@Module({
  imports: [GeneralModule, FaucetModule],
})
export class AppModule {}
