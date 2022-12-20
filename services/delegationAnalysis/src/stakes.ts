import axios from 'axios';
import { BigNumber } from 'ethers';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import fs from 'fs';
import { generationFolder } from './main';

const API_ENDPOINT = 'http://localhost:8000/subgraphs/name/taraxa_project/staking';

export interface StakingEvent {
  id: string;
  user: string;
  timestamp: number;
  amount: BigNumber;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

export interface StakingSummary {
  user: string;
  finalStakes: BigNumber;
  undelegated?: BigNumber;
}

async function getStakingEvents(first: number, skip: number): Promise<StakingEvent[]> {
  const query = `
    query getStakingEvents($first: Int, $skip: Int) {
      stakingEvents(orderBy: timestamp, where: {amount_gt: 0}, first: $first, skip: $skip) {
        id
        user
        timestamp
        amount
        type
      }
    }
  `;

  const variables = {
    first,
    skip,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      query,
      variables,
    }),
  };

  try {
    const response = await axios(API_ENDPOINT, options);
    return response.data.data.stakingEvents as StakingEvent[];
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
}

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
  const filePath = `${generationFolder}/staking-summaries-${new Date().getTime().toFixed(0)}.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'user', title: 'User Address' },
      { id: 'finalStakes', title: 'Final Stakes of Address' },
    ],
  });

  await csvWriter
    .writeRecords(stakingSummaries)
    .then(() => console.log(`Successfully wrote records to ${filePath}`))
    .catch((error) => console.error(error));
  return filePath;
}

export async function getAddressesWithPositiveStake(csvPath: string): Promise<StakingSummary[]> {
  // Use the createCsvParser function to create a CSV parser
  const stakes: StakingSummary[] = [];
  fs.createReadStream(csvPath)
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
      console.log(`Imported ${stakes.length} rows of data`);
    });

  return stakes;
}
