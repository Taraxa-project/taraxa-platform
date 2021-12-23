import { registerAs } from '@nestjs/config';

export default registerAs('delegation', () => ({
  coolingOffPeriodDays: 5,
}));
