import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesController } from './batches.controller';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';
import { BatchEntity } from './entity/batch.entity';
import { ClaimEntity } from './entity/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClaimEntity, BatchEntity])],
  controllers: [BatchesController, ClaimController],
  providers: [ClaimService],
})
export class ClaimModule {}
