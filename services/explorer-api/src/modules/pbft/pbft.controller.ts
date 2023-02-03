import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PbftEntity } from '@taraxa_project/explorer-shared';
import { PbftService } from './pbft.service';

@ApiTags('pbft')
@Controller('/pbft')
export class PbftController {
  constructor(private readonly service: PbftService) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [PbftEntity],
    description: 'Returns number of blocks produced this week',
  })
  @Get('total-this-week')
  public getTotalBlocksThisWeek(): Promise<number> {
    return this.service.getTotalBlocksThisWeek();
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [PbftEntity],
    description: 'Returns number of blocks produced this week',
  })
  @Get('genesis')
  public async getGenesisBlock(): Promise<Partial<PbftEntity>> {
    const genesisBlock = await this.service.getGenesisBlock();
    delete genesisBlock.id;
    return genesisBlock;
  }
}
