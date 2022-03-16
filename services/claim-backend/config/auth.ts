import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.AUTH_SECRET || 'secret',
  tokenExpiry: 60 * 60 * 24 * 30,
}));
