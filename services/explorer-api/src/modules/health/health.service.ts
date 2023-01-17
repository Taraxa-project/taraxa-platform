import { Injectable, Logger } from '@nestjs/common';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { gql, GraphQLClient } from 'graphql-request';
import { PbftService } from '../pbft/pbft.service';

type GqNodeState = {
  finalBlock: number;
  dagBlockLevel: number;
  dagBlockPeriod: number;
};

export type CurrentNodeState = GqNodeState & {
  latestIndexedBlock: number;
  totalBlocks: number;
};

@Injectable()
export class HealthService {
  private logger = new Logger('HealthService');

  constructor(
    @InjectGraphQLClient()
    private readonly graphQLClient: GraphQLClient,
    private pbftService: PbftService
  ) {}

  public async getNodeState(): Promise<CurrentNodeState> {
    const result = await this.graphQLClient.request(
      gql`
        query nodeState_query {
          nodeState {
            finalBlock
            dagBlockLevel
            dagBlockPeriod
          }
        }
      `
    );
    const latestIndexedBlock = await this.pbftService.getLatestIndexedBlock();
    const totalBlocks = await this.pbftService.getBlocksCount();
    return {
      ...result?.nodeState,
      latestIndexedBlock,
      totalBlocks: +totalBlocks,
    };
  }
}
