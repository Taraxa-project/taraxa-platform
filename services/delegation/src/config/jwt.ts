import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'b7a7f9de-a444-4db2-8db1-167b07eec6ea',
}));
