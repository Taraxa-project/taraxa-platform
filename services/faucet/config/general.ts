import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  env: process.env.NODE_ENV || 'development',
  disabled: process.env.DISABLED || false,
  maxRequestsForIpPerWeek: process.env.MAX_REQUESTS_FOR_IP_PER_WEEK
    ? parseInt(process.env.MAX_REQUESTS_FOR_IP_PER_WEEK, 10)
    : 7,
  maxAmountForIpPerWeek: process.env.MAX_AMOUNT_FOR_IP_PER_WEEK
    ? parseInt(process.env.MAX_AMOUNT_FOR_IP_PER_WEEK, 10)
    : 7,
  maxRequestsForAddressPerWeek: process.env.MAX_REQUESTS_FOR_ADDRESS_PER_WEEK
    ? parseInt(process.env.MAX_REQUESTS_FOR_ADDRESS_PER_WEEK, 10)
    : 7,
  maxAmountForAddressPerWeek: process.env.MAX_AMOUNT_FOR_ADDRESS_PER_WEEK
    ? parseInt(process.env.MAX_AMOUNT_FOR_ADDRESS_PER_WEEK, 10)
    : 7,
}));
