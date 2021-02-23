import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClaimEntity } from './entity/claim.entity';
import { FileDto } from './dto/file.dto';
import { BatchEntity } from './entity/batch.entity';
import * as parse from 'csv-parse/lib/sync';

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
  public async getClaim(id: number): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOneOrFail({ id });
    return claim;
  }
}
