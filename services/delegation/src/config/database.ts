import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  user: process.env.DATABASE_USER,
  pass: process.env.DATABASE_PASS,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  nameDelegation: process.env.DATABASE_DELEGATION_NAME,
  nameCommunity: process.env.DATABASE_COMMUNITY_NAME,
}));
