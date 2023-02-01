import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { IGQLDag, IGQLPBFT } from '../../types';

@Injectable()
export class GraphQLConnectorService {
  constructor(
    @InjectGraphQLClient()
    private readonly graphQLClient: GraphQLClient
  ) {}

  public async getPBFTBlocksByNumberFromTo(
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
                  timestamp
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

  public async getPBFTBlockForNumber(number: number) {
    return (
      await this.graphQLClient.request(
        gql`
          query block_query($number: Long, $hash: Bytes32) {
            block(number: $number, hash: $hash) {
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
                  timestamp
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
          number,
        }
      )
    )?.block;
  }

  public async getPBFTBlockHashForNumber(number: number) {
    return (
      await this.graphQLClient.request(
        gql`
          query block_query($number: Long, $hash: Bytes32) {
            block(number: $number, hash: $hash) {
              hash
            }
          }
        `,
        (number !== null || number !== undefined) && {
          number,
        }
      )
    )?.block;
  }

  /**
   * @note If no parameter is given for neither number or hash the last block is returned.
   * @param hash The PBFT block's hash that should be fetched.
   * @returns Block object containing number and parent object of the sought hash
   */
  public async getPBFTBlockNumberAndParentForHash(hash?: string) {
    return (
      await this.graphQLClient.request(
        gql`
          query block_query($number: Long, $hash: Bytes32) {
            block(number: $number, hash: $hash) {
              number
              parent {
                hash
              }
            }
          }
        `,
        hash && {
          hash,
        }
      )
    )?.block;
  }

  public async getDagBlockByHash(hash?: string): Promise<{
    hash: string;
    level: number;
    pbftPeriod: number;
  } | null> {
    return (
      await this.graphQLClient.request(
        gql`
          query dag_block_query($hash: Bytes32) {
            dagBlock(hash: $hash) {
              hash
              level
              pbftPeriod
            }
          }
        `,
        {
          hash,
        }
      )
    )?.dagBlock;
  }

  /**
   * Fetches DAG blocks based on PBFT period
   * @param period Optional if not give returns DAG from last PBFT period
   * @returns DAG array
   */
  public async getDagBlocksForPbftPeriod(period?: number): Promise<IGQLDag[]> {
    return (
      await this.graphQLClient.request(
        gql`
          query period_Dag_Blocks($period: Long!) {
            periodDagBlocks(period: $period) {
              hash
              pivot
              tips
              level
              pbftPeriod
              author {
                address
              }
              timestamp
              signature
              vdf
              transactions {
                hash
              }
              transactionCount
            }
          }
        `,
        {
          period,
        }
      )
    )?.periodDagBlocks;
  }
}
