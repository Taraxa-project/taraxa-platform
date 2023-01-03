/* eslint-disable no-promise-executor-return */
import { BigNumber } from 'ethers';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import fs from 'fs';
import chalk from 'chalk';
import { getStakingEvents } from './stakingSubgraph';
import { StakingEvent, StakingSummary } from './types';
import { runtimeConfig } from './config';

export async function getCurrentStakes(first: number, skip: number): Promise<string> {
  let responseLength = 1000;
  let stakingEvents: StakingEvent[] = [];
  let _skip = skip;
  while (responseLength === 1000) {
    const newStakingEvents = await getStakingEvents(first, _skip);
    stakingEvents = stakingEvents.concat(newStakingEvents);
    responseLength = newStakingEvents.length;
    _skip += first;
  }

  const stakingSummaries: StakingSummary[] = [];
  stakingEvents.forEach((event) => {
    if (event.type === 'DEPOSIT') {
      let summary = stakingSummaries.find((s) => s.user === event.user);
      if (!summary) {
        summary = {
          user: event.user,
          finalStakes: BigNumber.from('0'),
        };
        stakingSummaries.push(summary);
      }
      summary.finalStakes = summary.finalStakes.add(event.amount);
    } else if (event.type === 'WITHDRAWAL') {
      const summary = stakingSummaries.find((s) => s.user === event.user);
      if (!summary) {
        throw new Error(`User ${event.user} had negative stake at timestamp ${event.timestamp}`);
      }
      summary.finalStakes = summary.finalStakes.sub(event.amount);
      if (summary.finalStakes.lt(0)) {
        throw new Error(`User ${event.user} had negative stake at timestamp ${event.timestamp}`);
      }
    }
  });
  const filePath = `${runtimeConfig.outputDir}/staking-summaries-${new Date()
    .getTime()
    .toFixed(0)}.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'user', title: 'User Address' },
      { id: 'finalStakes', title: 'Final Stakes of Address' },
    ],
  });

  await csvWriter
    .writeRecords(stakingSummaries)
    .then(() => console.log(chalk.green(`Successfully wrote records to ${filePath}`)))
    .catch((error) => console.error(error));
  return filePath;
}

export async function getAddressesWithPositiveStake(csvPath: string): Promise<StakingSummary[]> {
  const stakes: StakingSummary[] = [];
  const read = new Promise((resolve, reject) =>
    fs
      .createReadStream(csvPath)
      .pipe(csv({ headers: ['user', 'finalStakes'], skipLines: 1 }))
      .on('data', (data) => {
        const stake = BigNumber.from(data.finalStakes);
        if (stake.gt('0')) {
          stakes.push({
            user: data.user,
            finalStakes: BigNumber.from(data.finalStakes),
          } as StakingSummary);
        }
      })
      .on('end', () => {
        console.log(chalk.green(`Imported ${stakes.length} rows of data`));
        resolve(1);
      })
      .on('error', (error) => {
        reject(error);
      }),
  );
  await read;
  return stakes;
}
