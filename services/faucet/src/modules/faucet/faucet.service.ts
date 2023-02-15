import { Queue } from 'bull';
import { ethers } from 'ethers';
import { MoreThan, Repository } from 'typeorm';
import { general } from '@faucet/config';
import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateRequestDto } from './dto';
import { RequestEntity, RequestStatus } from './entity';
import { TransactionRequest } from './types';

@Injectable()
export class FaucetService {
  constructor(
    @Inject(general.KEY)
    private readonly generalConfig: ConfigType<typeof general>,
    @InjectQueue('faucet')
    private readonly faucetQueue: Queue,
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    private readonly blockchainService: BlockchainService
  ) {}

  public async create(
    createRequestDto: CreateRequestDto,
    ip: string
  ): Promise<Omit<RequestEntity, 'id'>> {
    if (this.generalConfig.disabled) {
      throw new HttpException(
        'Faucet temporarily disabled',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // Check number of requests and amount
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // For IP
    const [requestsForIp, requestsCountForIp] =
      await this.requestRepository.findAndCount({
        where: {
          ip,
          createdAt: MoreThan(oneWeekAgo),
        },
      });
    // Number of requests
    if (requestsCountForIp >= this.generalConfig.maxRequestsForIpPerWeek) {
      throw new HttpException(
        'Too many requests for ip',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    // Amount
    const requestsAmountForIp = requestsForIp.reduce(
      (prev, curr) => prev + curr.amount,
      0
    );
    if (
      requestsAmountForIp >= this.generalConfig.maxAmountForIpPerWeek ||
      requestsAmountForIp + createRequestDto.amount >
        this.generalConfig.maxAmountForIpPerWeek
    ) {
      throw new HttpException(
        'Too many tokens requested for ip',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // For address
    const address = ethers.utils.getAddress(createRequestDto.address);
    const [requestsForAddress, requestsCountForAddress] =
      await this.requestRepository.findAndCount({
        where: {
          address,
          createdAt: MoreThan(oneWeekAgo),
        },
      });
    // Number of requests
    if (
      requestsCountForAddress >= this.generalConfig.maxRequestsForAddressPerWeek
    ) {
      throw new HttpException(
        'Too many requests for address',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    // Amount
    const requestsAmountForAddress = requestsForAddress.reduce(
      (prev, curr) => prev + curr.amount,
      0
    );
    if (
      requestsAmountForAddress >=
        this.generalConfig.maxAmountForAddressPerWeek ||
      requestsAmountForAddress + createRequestDto.amount >
        this.generalConfig.maxAmountForAddressPerWeek
    ) {
      throw new HttpException(
        'Too many tokens requested for address',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const request = new RequestEntity();
    request.address = address;
    request.amount = createRequestDto.amount;
    request.ip = ip;
    await this.requestRepository.save(request);
    await this.faucetQueue.add('faucet', new TransactionRequest(request.id), {
      attempts: 5,
    });

    const response = JSON.parse(JSON.stringify(request));
    delete response.id;

    return response;
  }

  public async broadcastTransaction(id: number): Promise<void> {
    const request = await this.requestRepository.findOneByOrFail({ id });

    const wallet = this.blockchainService.getWallet();
    try {
      const transfer = await wallet.sendTransaction({
        to: request.address,
        value: ethers.utils.parseEther(`${request.amount}`)?.toHexString(),
        gasLimit: 21000,
      });
      await transfer.wait();
      request.status = RequestStatus.DRIPPED;
    } catch (e) {
      console.error(e);
      request.status = RequestStatus.FAILED;
    }

    await this.requestRepository.save(request);
  }

  public async getById(uuid: string): Promise<Omit<RequestEntity, 'id'>> {
    const request = await this.requestRepository.findOneByOrFail({ uuid });
    const response = JSON.parse(JSON.stringify(request));
    delete response.id;

    return response;
  }
}
