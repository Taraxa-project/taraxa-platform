import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { NodeNotFoundException } from './exceptions/node-not-found-exception';
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
  async get(@Param('id', ParseIntPipe) id: number): Promise<Partial<Node>> {
    try {
      return await this.validatorService.get(id);
    } catch (e) {
      if (e instanceof NodeNotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw e;
      }
    }
  }
}
