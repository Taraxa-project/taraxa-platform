import { ethereum, general } from '@faucet/config';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateRequestDto } from './dto';
import { RequestEntity } from './entity';
import RequestLimit from './types/RequestLimit.enum';
import { filterRequestsOfThisWeek } from './utils';
import { toUTCDate } from './utils/utils';

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
      throw new BadRequestException(
        `You must ask for either ${RequestLimit.ONE}; ${RequestLimit.TWO}; ${RequestLimit.FIVE} or ${RequestLimit.SEVEN}`
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
        throw new BadRequestException(
          `You have exceeded the ${this.generalConfig.maxRewardPerWeek} TARA for this week. Please return nexgt week. Until then, happy hacking!`
        );
      const remainder = +this.generalConfig.maxRewardPerWeek! - total;
      if (remainder < requestDto.amount)
        throw new BadRequestException(
          `You can withdraw ${remainder} TARA tokens for the current week only. Please choose an amount smaller or equal to it.`
        );
    }
    const request = new RequestEntity();
    request.address = requestDto.address;
    request.amount = requestDto.amount;
    request.createdAt = toUTCDate(new Date(requestDto.timestamp));

    if (request) {
      const taraWallet = this.blockchainService.getWallet();
      if (!taraWallet)
        throw new InternalServerErrorException(
          'TARA wallet cannot be initialized. Please try again later.'
        );
      const sendTx: ethers.providers.TransactionRequest = {
        to: request.address,
        value: ethers.utils.parseEther(`${request.amount}`),
        gasPrice: 0,
        gasLimit: 100000000,
      };
      const transfer = await taraWallet.sendTransaction(sendTx);
      while (!transfer.hash) {
        console.log('waiting for confirmation');
      }
      if (transfer && transfer.hash) {
        request.txHash = transfer.hash;
        const registered = await this.requestRepository.save(request);
        return registered;
      } else
        throw new InternalServerErrorException(
          `${transfer.hash} was unsuccessful.`
        );
    }
    throw new InternalServerErrorException(
      'Database connection cannot be initialized. Please try again later.'
    );
  }
  public getAllRequests = (): Promise<RequestEntity[]> => {
    return this.requestRepository.find({});
  };
  public getByHash = (txHash: string): Promise<RequestEntity> => {
    return this.requestRepository.findOne({ txHash });
  };
}
