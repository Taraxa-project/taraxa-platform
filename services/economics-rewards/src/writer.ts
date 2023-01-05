import { createObjectCsvWriter } from 'csv-writer';
import { config } from 'dotenv';
import {
  getDelegators,
  getRewards,
  getValidators,
  initializeConnection,
} from './database';

config();

const outputDir = 'output';

const generateValidatorsCsv = async () => {
  const filePath = `${outputDir}/validators.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'blockNumber', title: 'Block Number' },
      { id: 'blockTimestamp', title: 'Block Timestamp' },
      { id: 'blockHash', title: 'Block Hash' },
      { id: 'account', title: 'Account' },
      { id: 'commission', title: 'Commission' },
      { id: 'commissionReward', title: 'Commission Reward' },
    ],
  });

  const validators = await getValidators();

  await csvWriter
    .writeRecords(validators)
    .then(() => console.log(`Successfully wrote validators to ${filePath}`))
    .catch((error) => console.error(error));
  return filePath;
};

const generateDelegatorsCsv = async () => {
  const filePath = `${outputDir}/delegators.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'blockNumber', title: 'Block Number' },
      { id: 'blockTimestamp', title: 'Block Timestamp' },
      { id: 'blockHash', title: 'Block Hash' },
      { id: 'validator', title: 'Validator' },
      { id: 'delegator', title: 'Delegator' },
      { id: 'stake', title: 'Stake' },
      { id: 'rewards', title: 'Rewards' },
    ],
  });

  const delegators = await getDelegators();

  await csvWriter
    .writeRecords(delegators)
    .then(() => console.log(`Successfully wrote delegators to ${filePath}`))
    .catch((error) => console.error(error));
  return filePath;
};

const generateRewardsCsv = async () => {
  const filePath = `${outputDir}/rewards.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'blockNumber', title: 'Block Number' },
      { id: 'blockTimestamp', title: 'Block Timestamp' },
      { id: 'blockHash', title: 'Block Hash' },
      { id: 'validator', title: 'Validator' },
      { id: 'delegator', title: 'Delegator' },
      { id: 'commission', title: 'Commission' },
      { id: 'commissionReward', title: 'Commission Reward' },
      { id: 'stake', title: 'Stake' },
      { id: 'rewards', title: 'Rewards' },
    ],
  });

  const rewards = await getRewards();

  await csvWriter
    .writeRecords(rewards)
    .then(() => console.log(`Successfully wrote rewards to ${filePath}`))
    .catch((error) => console.error(error));
  return filePath;
};

async function main() {
  await initializeConnection();
  await generateValidatorsCsv();
  await generateDelegatorsCsv();
  await generateRewardsCsv();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
