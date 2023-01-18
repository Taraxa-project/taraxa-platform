/* eslint-disable @typescript-eslint/no-unused-vars */
import { createObjectCsvWriter } from 'csv-writer';
import { config } from 'dotenv';
import {
  clearRewardsRowCount,
  getDelegators,
  getRewards,
  getRewardsRowCount,
  getValidators,
  initializeConnection,
  saveRewardsRowCount,
} from './database';
import fs from 'fs';

config();

const outputDir = 'output';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

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
  const chunkSize = 1000;
  let offset = 0;
  let done = false;
  let rowCount = 0;
  const savedRowCount = await getRewardsRowCount();
  console.log('Starting at row: ', savedRowCount);

  if (savedRowCount && savedRowCount > 0) {
    rowCount = savedRowCount;
    offset = rowCount;
  }

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
  while (!done) {
    // execute the query with the current offset and limit
    const rewards = await getRewards(` LIMIT ${chunkSize} OFFSET ${offset}`);

    // if no rows are returned, we've fetched all the data
    if (rewards.length === 0) {
      done = true;
      continue;
    }
    // write the rows to the CSV file
    await csvWriter.writeRecords(rewards);

    // update the offset for the next iteration
    offset += chunkSize;
    rowCount += rewards.length;

    await saveRewardsRowCount(rowCount);
  }

  console.log(`Successfully wrote rewards to ${filePath}`);
  await clearRewardsRowCount();
  return filePath;
};

async function main() {
  await initializeConnection();
  // await generateValidatorsCsv();
  // await generateDelegatorsCsv();
  await generateRewardsCsv();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
