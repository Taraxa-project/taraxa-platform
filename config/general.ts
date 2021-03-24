import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  env: process.env.NODE_ENV || 'development',
  unlockerInterval: '0 * * * *',
  precision: 3,
}));
