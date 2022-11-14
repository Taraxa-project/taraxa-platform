import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  wsConnectionURL: process.env.NODE_WS_ENDPOINT,
  wsReconnectInterval: Number(process.env.WS_RECONNECT_INTERVAL),
  rpcConnectionURL: process.env.NODE_RPC_ENDPOINT,
  graphQLConnectionURL: process.env.NODE_GRAPHQL_ENDPOINT,
  redisHost: process.env.REDIS_HOST,
  redisPort: Number(process.env.REDIS_PORT),
  port: Number(process.env.WS_SERVER_PORT),
  isProducer: process.env.ENABLE_PRODUCER_MODULE,
}));
