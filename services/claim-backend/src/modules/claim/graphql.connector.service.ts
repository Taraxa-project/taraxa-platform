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

  public async getClaim(
    address: string,
    amount: string,
    nonce: number,
  ): Promise<ClaimDetails | null> {
    const response = await this.graphQLClient.request<{
      claims: ClaimDetails[];
    }>(
      gql`
        query get_claims($address: Bytes!, $amount: BigInt!, $nonce: BigInt!) {
          claims(where: { user: $address, amount: $amount, nonce: $nonce }) {
            user
            amount
            nonce
            timestamp
          }
        }
      `,
      {
        address,
        amount,
        nonce,
      },
    );

    if (!response) {
      return null;
    }

    if (!response.claims || response.claims.length === 0) {
      return null;
    }

    return response.claims[0] as ClaimDetails;
  }
}
