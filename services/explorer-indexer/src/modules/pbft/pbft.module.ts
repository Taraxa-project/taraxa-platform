import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity } from './pbft.entity';
import PbftService from './pbft.service';

@Module({
  imports: [TypeOrmModule.forFeature([PbftEntity])],
  providers: [PbftService],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
