import { general } from '@faucet/config';
import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { ethers } from 'ethers';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateRequestDto } from './dto';
import { RequestEntity } from './entity';
import { TransactionRequest } from './types';
import RequestLimit from './types/RequestLimit.enum';
import { filterRequestsOfThisWeek } from './utils';
import { toUTCDate } from './utils/utils';

@Injectable()
export class FaucetService {
  private readonly logger = new Logger(FaucetService.name);
  constructor(
    @InjectQueue('faucet')
    private readonly faucetQueue: Queue,
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    @Inject(general.KEY)
    private readonly generalConfig: ConfigType<typeof general>,
    private readonly blockchainService: BlockchainService
  ) {}

  public async registerRequest(
    requestDto: CreateRequestDto,
    ip: string
  ): Promise<void> {
    if (!(requestDto.amount in RequestLimit))
      throw new BadRequestException(
        `You must ask for either ${RequestLimit.ONE}; ${RequestLimit.TWO}; ${RequestLimit.FIVE} or ${RequestLimit.SEVEN}`
      );
    requestDto.address = ethers.utils.getAddress(requestDto.address);
    const requestsForAddressOrIp = await this.requestRepository.find({
      where: [{ address: requestDto.address }, { ip }],
    });
    const requestsOfThisWeek = filterRequestsOfThisWeek(requestsForAddressOrIp);
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
    const sendTx: ethers.providers.TransactionRequest = {
      to: requestDto.address,
      value: ethers.utils.parseEther(`${requestDto.amount}`).toHexString(),
      gasPrice: 0,
      gasLimit: 100000000,
    };
    await this.faucetQueue.add(
      'faucet',
      new TransactionRequest(
        toUTCDate(new Date(requestDto.timestamp)),
        ip,
        sendTx
      ),
      { attempts: 5 }
    );
  }

  public async broadcastTransaction(
    transaction: TransactionRequest
  ): Promise<void> {
    const request = new RequestEntity();
    request.address = transaction.txRequest.to!;
    request.amount = +ethers.utils.formatEther(transaction.txRequest.value!);
    request.ip = transaction.ip;
    request.createdAt = toUTCDate(new Date(transaction.timestamp));

    if (request) {
      const taraWallet = this.blockchainService.getWallet();
      if (!taraWallet)
        throw new InternalServerErrorException(
          'TARA wallet cannot be initialized. Please try again later.'
        );
      try {
        const transfer = await taraWallet.sendTransaction(
          transaction.txRequest
        );
        while (!transfer.hash) {}
        if (transfer && transfer.hash) {
          request.txHash = transfer.hash;
          const registered = await this.requestRepository.save(request);
          this.logger.log(
            `Transaction ${registered.txHash} was broadcasted for address ${registered.address}: ${registered.amount} TARA`
          );
          if (!registered)
            throw new InternalServerErrorException(
              'Database save was unsuccessful. Please try again later.'
            );
        } else
          throw new InternalServerErrorException(
            `${transfer.hash} was unsuccessful.`
          );
      } catch (error) {
        throw new Error(`${error}`);
      }
    } else {
      throw new InternalServerErrorException(
        'Database connection cannot be initialized. Please try again later.'
      );
    }
  }

  public getAllRequests = (): Promise<RequestEntity[]> => {
    return this.requestRepository.find({});
  };
  public getByHash = (txHash: string): Promise<RequestEntity> => {
    return this.requestRepository.findOneOrFail({ txHash });
  };
}
