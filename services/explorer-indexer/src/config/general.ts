import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  wsConnectionURL: process.env.NODE_WS_ENDPOINT,
  rpcConnectionURL: process.env.NODE_RPC_ENDPOINT,
  graphQLConnectionURL: process.env.NODE_GRAPHQL_ENDPOINT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  port: process.env.WS_SERVER_PORT,
  isProducer: process.env.ENABLE_PRODUCER_MODULE,
}));
