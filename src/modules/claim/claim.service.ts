import * as parse from 'csv-parse/lib/sync';
import * as ethUtil from 'ethereumjs-util';
import * as abi from 'ethereumjs-abi';
import { LessThan, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethereum } from '@taraxa-claim/config';
import { CollectionResponse } from '@taraxa-claim/common';
import { ClaimEntity } from './entity/claim.entity';
import { AccountClaimEntity } from './entity/account-claim.entity';
import { FileDto } from './dto/file.dto';
import { BatchEntity } from './entity/batch.entity';
import { AccountEntity } from './entity/account.entity';

@Injectable()
export class ClaimService {
  privateKey: Buffer;
  constructor(
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(ClaimEntity)
    private readonly claimRepository: Repository<ClaimEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>,
  ) {
    this.privateKey = Buffer.from(this.ethereumConfig.privateSigningKey, 'hex');
  }
  public async createBatch(file: FileDto): Promise<ClaimEntity[]> {
    const batch = new BatchEntity();
    const claims = await this.updateAccounts(this.parseCsv(file.buffer));
    batch.claims = claims;
    await this.batchRepository.save(batch);

    return batch.claims;
  }
  public async batch(id: number): Promise<BatchEntity> {
    return this.batchRepository.findOneOrFail({ id });
  }
  public async deleteBatch(id: number): Promise<BatchEntity> {
    const batch = await this.batchRepository.findOneOrFail({ id });
    return this.batchRepository.remove(batch);
  }
  public async batches(
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<BatchEntity>> {
    const batches = new CollectionResponse<BatchEntity>();
    [batches.data, batches.count] = await this.batchRepository.findAndCount({
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
    });
    return batches;
  }
  public async claim(id: number): Promise<ClaimEntity> {
    return this.claimRepository.findOneOrFail({ id });
  }
  public async deleteClaim(id: number): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOneOrFail({ id });
    return this.claimRepository.remove(claim);
  }
  public async claims(
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<ClaimEntity>> {
    const claims = new CollectionResponse<ClaimEntity>();
    [claims.data, claims.count] = await this.claimRepository.findAndCount({
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
    });
    return claims;
  }
  public async accounts(
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<AccountEntity>> {
    const accounts = new CollectionResponse<AccountEntity>();
    [accounts.data, accounts.count] = await this.accountRepository.findAndCount(
      {
        order: { [sort[0]]: sort[1] },
        skip: range[0],
        take: range[1] - range[0] + 1,
      },
    );
    return accounts;
  }
  public async account(address: string): Promise<Partial<AccountEntity>> {
    const account = JSON.parse(
      JSON.stringify(await this.accountRepository.findOneOrFail({ address })),
    );
    delete account.id;
    return account;
  }
  public async accountClaim(address: string): Promise<AccountClaimEntity> {
    const {
      id,
      availableToBeClaimed,
    } = await this.accountRepository.findOneOrFail({ address });

    if (availableToBeClaimed <= 0) {
      throw new Error('No tokens to claim');
    }

    const nonce = id * 13;
    const encodedPayload = abi.soliditySHA3(
      ['address', 'uint', 'uint'],
      [address, availableToBeClaimed, nonce],
    );

    const { v, r, s } = ethUtil.ecsign(encodedPayload, this.privateKey);
    const hash = ethUtil.toRpcSig(v, r, s);

    return {
      availableToBeClaimed,
      nonce,
      hash,
    };
  }
  public async unlockRewards(): Promise<void> {
    const now = new Date();
    const claims = await this.claimRepository.find({
      where: { isUnlocked: false, unlockDate: LessThan(now) },
      relations: ["account"],
    });

    for(const claim of claims) {
      claim.isUnlocked = true;
      claim.account.availableToBeClaimed += claim.numberOfTokens;
      claim.account.totalLocked -= claim.numberOfTokens;

      await this.claimRepository.save(claim);
      await this.accountRepository.save(claim.account);
    }
  }
  private async updateAccounts(claims: ClaimEntity[]): Promise<ClaimEntity[]> {
    const nClaims = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const claim of claims) {
      const { address, unlockDate, numberOfTokens } = claim;
      let account = await this.accountRepository.findOne({
        address,
      });
      const availableToBeClaimed = unlockDate < now ? numberOfTokens : 0;
      const totalLocked = unlockDate > now ? numberOfTokens : 0;
      if (account) {
        account.availableToBeClaimed =
          account.availableToBeClaimed + availableToBeClaimed;
        account.totalLocked = account.totalLocked + totalLocked;
      } else {
        account = new AccountEntity();
        account.address = address;
        account.availableToBeClaimed = availableToBeClaimed;
        account.totalLocked = totalLocked;
      }
      await this.accountRepository.save(account);
      claim.account = account;
      nClaims.push(claim);
    }
    return nClaims;
  }
  private parseCsv(buffer: Buffer) {
    let claims = parse(buffer, {
      delimiter: ';',
      cast: false,
      castDate: false,
      trim: true,
      skipEmptyLines: true,
      skipLinesWithEmptyValues: true,
      skipLinesWithError: true,
    }).map((line: string[]) => {
      return line.filter((l: string) => {
        return l !== '';
      });
    });

    claims = claims.filter((line: string[]) => line.length === 3);
    claims = claims.filter((line: string[], index: number) => index !== 0);

    claims = claims.map((line: string[]) => {
      const claim = new ClaimEntity();
      claim.address = line[0].toString();
      claim.numberOfTokens = parseInt(line[1], 10);
      claim.unlockDate = new Date(line[2]);

      return claim;
    });

    return claims;
  }
}
