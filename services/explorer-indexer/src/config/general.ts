import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  wsConnectionURL: process.env.NODE_WS_ENDPOINT,
  rpcConnectionURL: process.env.NODE_RPC_ENDPOINT,
  port: process.env.WS_SERVER_PORT,
}));
