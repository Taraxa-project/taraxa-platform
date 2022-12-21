import { config } from 'dotenv';

config();

export const databaseConfig = {
  delegationHost: `${process.env.DELEGATION_HOST}`,
  delegationPort: Number(`${process.env.DELEGATION_PORT}`),
  delegationUser: `${process.env.DELEGATION_USER}`,
  delegationPassword: `${process.env.DELEGATION_PASS}`,
  delegationDatabase: `${process.env.DELEGATION_DB}`,
  taraxaProdHost: `${process.env.USERDATA_HOST}`,
  taraxaProdPort: Number(`${process.env.USERDATA_PORT}`),
  taraxaProdUser: `${process.env.USERDATA_USER}`,
  taraxaProdPassword: `${process.env.USERDATA_PASS}`,
  taraxaProdDatabase: `${process.env.USERDATA_DB}`,
};

export const runtimeConfig = {
  outputDir: `${process.env.GENERATED_DEST_FOLDER}`,
  stakingSubgraphURL: `${process.env.GRAPHQL_STAKING_URL}`,
};
