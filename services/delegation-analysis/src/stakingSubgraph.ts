import axios from 'axios';
import { runtimeConfig } from './config';
import { StakingEvent } from './types';

export async function getStakingEvents(first: number, skip: number): Promise<StakingEvent[]> {
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
    const response = await axios(runtimeConfig.stakingSubgraphURL, options);
    return response.data.data.stakingEvents as StakingEvent[];
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
}
