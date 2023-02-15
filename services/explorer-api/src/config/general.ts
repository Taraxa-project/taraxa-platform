import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  tokenPriceURL: process.env.TOKEN_PRICE_API_ENDPOINT,
  graphQLConnectionURL: process.env.NODE_GRAPHQL_ENDPOINT,
}));
