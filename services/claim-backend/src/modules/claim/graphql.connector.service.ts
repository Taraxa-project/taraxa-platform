import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { ClaimDetails } from './type/ClaimDetails';

@Injectable()
export class GraphQLService {
  constructor(
    @InjectGraphQLClient()
    private readonly graphQLClient: GraphQLClient,
  ) {}

  public async getIndexedClaim(
    address: string,
    amount: string,
    nonce: number,
  ): Promise<ClaimDetails[]> {
    return (
      await this.graphQLClient.request(
        gql`
          query get_claims(
            $address: Bytes!
            $amount: BigInt!
            $nonce: BigInt!
          ) {
            claims(where: { user: $address, amount: $amount, nonce: $nonce }) {
              user
              amount
              nonce
            }
          }
        `,
        {
          address,
          amount,
          nonce,
        },
      )
    )?.claims as ClaimDetails[];
  }
}
