import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Validator } from './validator.entity';

@Injectable()
export class ValidatorService {
  constructor(
    @InjectRepository(Validator)
    private validatorRepository: Repository<Validator>,
  ) {}
  find(): Promise<Validator[]> {
    return this.validatorRepository.find();
  }
}
