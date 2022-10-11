import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  connectionURL: process.env.NODE_WS_ENDPOINT,
  port: process.env.WS_SERVER_PORT,
}));
