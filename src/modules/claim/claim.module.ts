import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchController } from './batch.controller';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';
import { BatchEntity } from './entity/batch.entity';
import { ClaimEntity } from './entity/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClaimEntity, BatchEntity])],
  controllers: [BatchController, ClaimController],
  providers: [ClaimService],
})
export class ClaimModule {}
