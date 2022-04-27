import { registerAs } from '@nestjs/config';

export default registerAs('reward', () => ({
  communitySiteApiUrl: process.env.COMMUNITY_SITE_API_URL,
  delegationApiUrl: process.env.DELEGATION_API_URL,
}));
