import { ethereum, general } from '@faucet/config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { Repository } from 'typeorm';
import {
  BlockchainService,
  ContractTypes,
} from '../blockchain/blockchain.service';
import { CreateRequestDto } from './dto';
import { RequestEntity } from './entity';
import RequestLimit from './types/RequestLimit.enum';
import { filterRequestsOfThisWeek } from './utils';

@Injectable()
export class FaucetService {
  privateKey: Buffer;
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    @Inject(general.KEY)
    private readonly generalConfig: ConfigType<typeof general>,
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>,
    private readonly blockchainService: BlockchainService
  ) {
    this.privateKey = Buffer.from(
      this.ethereumConfig.privateSigningKey!,
      'hex'
    );
  }
  public async registerRequest(
    requestDto: CreateRequestDto
  ): Promise<RequestEntity> {
    if (!(requestDto.amount in RequestLimit))
      throw new Error(
        `You must ask for either ${RequestLimit.ONE}; ${RequestLimit.FIVE}; ${RequestLimit.TEN} or ${RequestLimit.FIFTY}`
      );
    requestDto.address = ethers.utils.getAddress(requestDto.address);
    const requestsForAddress = await this.requestRepository.find({
      address: requestDto.address,
    });

    const requestsOfThisWeek = filterRequestsOfThisWeek(requestsForAddress);
    if (requestsOfThisWeek && requestsOfThisWeek.length > 0) {
      const total = requestsOfThisWeek
        .map((r) => r.amount)
        .reduce((curr, next) => curr + next);
      if (total >= +this.generalConfig.maxRewardPerWeek!)
        throw new Error(
          `You have exceeded the ${this.generalConfig.maxRewardPerWeek} TARA for this week. Please return nexgt week. Until then, happy hacking!`
        );
      const remainder =
        +this.generalConfig.maxRewardPerWeek! - requestDto.amount;
      if (remainder < requestDto.amount)
        throw new Error(
          `You can withdraw ${remainder} TARA tokens for the current week only. Please choose an amount smaller or equal to it.`
        );
    }
    const request = new RequestEntity();
    request.address = requestDto.address;
    request.amount = requestDto.amount;
    request.createdAt = requestDto.timestamp;

    if (request) {
      const taraContract = this.blockchainService.getContractInstance(
        ContractTypes.TARA,
        this.ethereumConfig.contractAddress!
      );
      if (!taraContract)
        throw new Error(
          'TARA contract cannot be initialized. Please try again later.'
        );
      const transfer = await taraContract
        .connect(this.blockchainService.wallet)
        .transfer(
          this.ethereumConfig.contractAddress,
          request.address,
          ethers.utils.parseEther(`${request.amount}`)
        );
      if (transfer) {
        const registered = await this.requestRepository.save(request);
        return registered;
      } else throw new Error(`${transfer} was unsuccessful.`);
    }
    throw new Error(
      'Databse connection cannot be initialized. Please try again later.'
    );
  }
}
