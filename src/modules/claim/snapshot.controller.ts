import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import {
  Query,
  QueryDto,
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';
import { BatchEntity } from './entity/batch.entity';
import { SnapshotEntity } from './entity/snapshot.entity';

@ApiBearerAuth()
@ApiTags('snapshots')
@UseGuards(JwtAuthGuard)
@Controller('snapshots')
export class SnapshotController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getSnapshots(
    @Query([
      'id',
      'address',
      'availableToBeClaimed',
      'totalLocked',
      'totalClaimed',
    ])
    query: QueryDto,
  ): Promise<CollectionResponse<SnapshotEntity>> {
    return await this.claimService.snapshots(query.range, query.sort);
  }
}
