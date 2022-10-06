import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftController } from './pbft.controller';
import { PbftEntity } from './pbft.entity';
import { PbftService } from './pbft.service';

@Module({
  imports: [TypeOrmModule.forFeature([PbftEntity])],
  providers: [PbftService],
  controllers: [PbftController],
})
export class PbftModule {}
