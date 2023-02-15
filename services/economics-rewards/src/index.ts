#!/usr/bin/env node
import { fetchLatestBlockNumber, initializeConnection } from './database';
import { getContractInstance } from './contract';
import { getBlockValidators } from './validators';
import { getBlockDelegators } from './delegators';

async function main() {
  await initializeConnection();
  const { currentBlock } = await getContractInstance();
  const latestBlock = await fetchLatestBlockNumber();
  console.log('Final Block is: ', currentBlock);
  console.log('Latest block is: ', latestBlock);
  const startBlock = latestBlock ? latestBlock : 0;
  console.log('Start block is: ', startBlock);
  for (let i = startBlock; i <= currentBlock; i++) {
    await getBlockValidators(i);
    await getBlockDelegators(i);
    console.log('Finishing block: ', i);
  }
  process.exit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
