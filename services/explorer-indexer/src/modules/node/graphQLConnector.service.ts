import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { IGQLPBFT } from '../pbft';

@Injectable()
export class GraphQLConnector {
  constructor(
    @InjectGraphQLClient()
    private readonly graphQLClient: GraphQLClient
  ) {}

  public async getBlocksByNumberFromTo(
    from: number,
    to: number
  ): Promise<IGQLPBFT[]> {
    return (
      await this.graphQLClient.request(
        gql`
          query get_pbfts_from($from: Long!, $to: Long!) {
            blocks(from: $from, to: $to) {
              number
              hash
              stateRoot
              gasLimit
              gasUsed
              timestamp
              transactionCount
              parent {
                hash
              }
              difficulty
              totalDifficulty
              miner {
                address
              }
              transactionsRoot
              extraData
              logsBloom
              mixHash
              receiptsRoot
              ommerHash
              nonce
              stateRoot
              transactions {
                block {
                  hash
                  number
                }
                hash
                nonce
                status
                from {
                  address
                }
                to {
                  address
                }
                gas
                gasUsed
                cumulativeGasUsed
                gasPrice
                inputData
                r
                v
                s
                index
                value
              }
            }
          }
        `,
        {
          from,
          to,
        }
      )
    )?.blocks;
  }
}
