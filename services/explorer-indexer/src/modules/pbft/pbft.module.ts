import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity } from './pbft.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PbftEntity])],
  providers: [],
  controllers: [],
})
export class PbftModule {}
