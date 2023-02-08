import { registerAs } from '@nestjs/config';

export default registerAs('general', () => {
  const prefix = process.env.APP_PREFIX ? `:${process.env.APP_PREFIX}` : '';
  return {
    wsConnectionURL: process.env.NODE_WS_ENDPOINT,
    wsReconnectInterval: Number(process.env.WS_RECONNECT_INTERVAL),
    rpcConnectionURL: process.env.NODE_RPC_ENDPOINT,
    graphQLConnectionURL: process.env.NODE_GRAPHQL_ENDPOINT,
    queuePrefix: `explorer-indexer${prefix}`,
    redisHost: process.env.QUEUE_HOST,
    redisPort: Number(process.env.QUEUE_PORT),
    redisPassword: process.env.QUEUE_PASS,
    isProducer: process.env.ENABLE_PRODUCER_MODULE,
    isTransactionConsumer: process.env.ENABLE_TRANSACTION_CONSUMER === 'true',
    reorgThreshold: Number(process.env.REORG_THRESHOLD || 30),
    maxLockDuration: Number(process.env.QUEUE_MAX_LOCK_DURATION || 30000),
  };
});
