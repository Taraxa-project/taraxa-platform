import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => {
  const prefix = process.env.APP_PREFIX ? `:${process.env.APP_PREFIX}` : '';
  return {
    host: process.env.QUEUE_HOST || '127.0.0.1',
    port: parseInt(process.env.QUEUE_PORT!, 10) || 6379,
    pass: process.env.QUEUE_PASS || undefined,
    prefix: `faucet${prefix}`,
  };
});
