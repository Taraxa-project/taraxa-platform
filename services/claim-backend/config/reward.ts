import { registerAs } from '@nestjs/config';

export default registerAs('reward', () => ({
  communitySiteApiUrl: process.env.COMMUNITY_SITE_API_URL,
  delegationApiUrl: process.env.DELEGATION_API_URL,
  graphQLClaimUrl: `${process.env.GRAPH_QL_CLAIM_ENDPOINT}/subgraphs/id/${process.env.CLAIM_SUBGRAPH_ID}`,
}));
