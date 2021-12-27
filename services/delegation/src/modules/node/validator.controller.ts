import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { Validator } from './validator.entity';
import { ValidatorService } from './validator.service';

@Public()
@ApiTags('validators')
@Controller('validators')
export class ValidatorController {
  constructor(private validatorService: ValidatorService) {}

  @ApiOkResponse({ description: 'Validators found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  findAllNodes(): Promise<Validator[]> {
    return this.validatorService.find();
  }
}
