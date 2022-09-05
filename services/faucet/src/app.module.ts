import { FaucetModule } from '@faucet/faucet';
import { Module } from '@nestjs/common';
import { GeneralModule } from './general.module';
import { RequestEntity } from './modules/faucet/entity';

export const entities = [RequestEntity];
@Module({
  imports: [GeneralModule, FaucetModule],
})
export class AppModule {}
