import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClaimEntity } from './entity/claim.entity';
import { FileDto } from './dto/file.dto';
import { BatchEntity } from './entity/batch.entity';
import * as parse from 'csv-parse/lib/sync';
import { CollectionResponse } from '@taraxa-claim/common';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(ClaimEntity)
    private readonly claimRepository: Repository<ClaimEntity>,
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
  public async batches(): Promise<CollectionResponse<BatchEntity>> {
    const batches = new CollectionResponse<BatchEntity>();
    [batches.data, batches.count] = await this.batchRepository.findAndCount();
    return batches;
  }
  public async claim(id: number): Promise<ClaimEntity> {
    return this.claimRepository.findOneOrFail({ id });
  }
  public async claims(): Promise<CollectionResponse<ClaimEntity>> {
    const claims = new CollectionResponse<ClaimEntity>();
    [claims.data, claims.count] = await this.claimRepository.findAndCount();
    return claims;
  }
  private parseCsv(buffer: Buffer) {
    const claims = parse(buffer, {
      delimiter: ';',
      fromLine: 2,
      cast: false,
      castDate: false,
      trim: true,
    }).map((line: any) => {
      const claim = new ClaimEntity();
      claim.address = line[1].toString();
      claim.numberOfTokens = parseInt(line[2], 10);
      claim.claimDate = new Date(line[3]);
      return claim;
    });

    return claims;
  }
}
