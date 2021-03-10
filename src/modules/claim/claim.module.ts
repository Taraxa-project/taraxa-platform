import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entity/batch.entity';
import { ClaimEntity } from './entity/claim.entity';
import { SnapshotEntity } from './entity/snapshot.entity';
import { BatchController } from './batch.controller';
import { ClaimController } from './claim.controller';
import { SnapshotController } from './snapshot.controller';
import { ClaimService } from './claim.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClaimEntity, BatchEntity, SnapshotEntity]),
  ],
  controllers: [BatchController, ClaimController, SnapshotController],
  providers: [ClaimService],
})
export class ClaimModule {}
