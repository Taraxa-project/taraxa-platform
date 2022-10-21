import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftController } from './pbft.controller';
import { PbftService } from './pbft.service';
import { PbftEntity } from '@taraxa_project/explorer-shared';

@Module({
  imports: [TypeOrmModule.forFeature([PbftEntity])],
  providers: [PbftService],
  controllers: [PbftController],
})
export class PbftModule {}
