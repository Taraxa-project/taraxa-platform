import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entity/batch.entity';
import { ClaimEntity } from './entity/claim.entity';
import { AccountEntity } from './entity/account.entity';
import { BatchController } from './batch.controller';
import { ClaimController } from './claim.controller';
import { AccountController } from './account.controller';
import { ClaimService } from './claim.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClaimEntity, BatchEntity, AccountEntity]),
  ],
  controllers: [BatchController, ClaimController, AccountController],
  providers: [ClaimService],
  exports: [ClaimService],
})
export class ClaimModule {}
