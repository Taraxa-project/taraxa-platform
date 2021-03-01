import * as parse from 'csv-parse/lib/sync';
import * as ethUtil from 'ethereumjs-util';
import * as abi from 'ethereumjs-abi';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethereum } from '@taraxa-claim/config';
import { CollectionResponse } from '@taraxa-claim/common';
import { ClaimEntity } from './entity/claim.entity';
import { UserClaimEntity } from './entity/userClaim.entity';
import { FileDto } from './dto/file.dto';
import { BatchEntity } from './entity/batch.entity';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(ClaimEntity)
    private readonly claimRepository: Repository<ClaimEntity>,
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>,
  ) {}
  public async createBatch(file: FileDto): Promise<ClaimEntity[]> {
    const batch = new BatchEntity();
    const claims = this.parseCsv(file.buffer);
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
  public async batches(): Promise<CollectionResponse<BatchEntity>> {
    const batches = new CollectionResponse<BatchEntity>();
    [batches.data, batches.count] = await this.batchRepository.findAndCount();
    return batches;
  }
  public async claim(id: number): Promise<ClaimEntity> {
    return this.claimRepository.findOneOrFail({ id });
  }
  public async deleteClaim(id: number): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOneOrFail({ id });
    return this.claimRepository.remove(claim);
  }
  public async claims(): Promise<CollectionResponse<ClaimEntity>> {
    const claims = new CollectionResponse<ClaimEntity>();
    [claims.data, claims.count] = await this.claimRepository.findAndCount();
    return claims;
  }
  public async userClaims(
    address: string,
  ): Promise<CollectionResponse<UserClaimEntity>> {
    const claims = new CollectionResponse<UserClaimEntity>();
    const [data, count] = await this.claimRepository.findAndCount({
      where: { address, status: 1 },
    });

    const privateKey = Buffer.from(
      this.ethereumConfig.privateSigningKey,
      'hex',
    );
    claims.data = data.map(c => {
      const nonce = c.id * 13;
      const encodedPayload = abi.soliditySHA3(
        ['address', 'uint', 'uint'],
        [c.address, c.numberOfTokens, nonce],
      );

      const { v, r, s } = ethUtil.ecsign(encodedPayload, privateKey);
      const hash = ethUtil.toRpcSig(v, r, s);

      return {
        hash,
        nonce,
        numberOfTokens: c.numberOfTokens,
        unlockDate: c.unlockDate,
      };
    });
    claims.count = count;
    return claims;
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
