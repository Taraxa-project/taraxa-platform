import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { Node } from './node.entity';
import { ValidatorService } from './validator.service';

@Public()
@ApiTags('validators')
@Controller('validators')
export class ValidatorController {
  constructor(private validatorService: ValidatorService) {}

  @ApiOkResponse({ description: 'Validators found' })
  @Get()
  findAllNodes(): Promise<Partial<Node>[]> {
    return this.validatorService.find();
  }

  @ApiOkResponse({ description: 'Validator found' })
  @ApiNotFoundResponse({ description: 'Node not found' })
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Partial<Node>> {
    return this.validatorService.get(id);
  }
}
