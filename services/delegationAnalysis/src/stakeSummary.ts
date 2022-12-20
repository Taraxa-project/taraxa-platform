/* eslint-disable no-restricted-syntax */
import { createObjectCsvWriter } from 'csv-writer';
import { BigNumber } from 'ethers';
import PostgresConnector from './database';
import { generationFolder } from './main';
import { StakingSummary } from './stakes';

export interface DelegationWarning {
  userId: string;
  address: string;
  stakedAmount: BigNumber;
  delegatedAmount: BigNumber;
  undelegated: BigNumber;
  email?: string;
}

export function getUsersWithLowerDelegation(
  delegations: { user: string; address: string; value: string }[],
  stakingSummaries: StakingSummary[],
): DelegationWarning[] {
  const result: DelegationWarning[] = [];

  stakingSummaries.forEach((summary) => {
    // Find the matching data object for the current summary
    const matchingDelegation = delegations.find(
      (d) => d.address.toLowerCase() === summary.user.toLowerCase(),
    );
    const undelegationSummary = {} as DelegationWarning;
    if (matchingDelegation) {
      // If the value field of the data object is lower than the finalStakes field of the summary object, add the user to the result array
      console.log(
        `Address ${summary.user} has stake of ${summary.finalStakes.toString()} and delegation of ${
          matchingDelegation.value
        }`,
      );
      if (BigNumber.from(matchingDelegation.value).lt(summary.finalStakes)) {
        undelegationSummary.undelegated = BigNumber.from(summary.finalStakes).sub(
          matchingDelegation.value,
        );
        undelegationSummary.delegatedAmount = BigNumber.from(matchingDelegation.value);
        undelegationSummary.userId = matchingDelegation.user;
        result.push(undelegationSummary);
      }
    } else {
      undelegationSummary.delegatedAmount = BigNumber.from('0');
      undelegationSummary.undelegated = undelegationSummary.stakedAmount;
    }
    undelegationSummary.stakedAmount = summary.finalStakes;
    undelegationSummary.address = summary.user;
  });
  console.log(`${result.length} users had lower delegation than stake!`);
  return result;
}

export async function writeDelegationDataToCsv(
  delegations: { user: string; address: string; value: string }[],
) {
  const filePath = `${generationFolder}/delegations-${new Date().getTime().toFixed(0)}.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'userId', title: 'User ID' },
      { id: 'address', title: 'Address' },
      { id: 'value', title: 'Delegation Value' },
    ],
  });

  const bigNumbersToString = delegations.map((s) => {
    return {
      address: s.address,
      value: s.value.toString(),
      userId: s.user,
    };
  });

  await csvWriter
    .writeRecords(bigNumbersToString)
    .then(() => console.log(`Successfully wrote delegations to ${filePath}`))
    .catch((error) => console.error(error));
  return filePath;
}

export async function writeFinalDelegationWarningsToCSV(
  summary: DelegationWarning[],
  userConnector: PostgresConnector,
) {
  for (const finalValues of summary) {
    console.log(`Searching for email of ${finalValues.address}`);
    const userData = await userConnector.getUserEmail(finalValues.address);
    if (userData) {
      finalValues.email = userData.email;
      console.log(`Found ${finalValues.email} for user ${finalValues.address}`);
    }
  }

  const filePath = `${generationFolder}/undelegation-warnings-${new Date()
    .getTime()
    .toFixed(0)}.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'userId', title: 'User ID' },
      { id: 'address', title: 'User Address' },
      { id: 'email', title: 'User Email' },
      { id: 'stakedAmount', title: 'Total staked' },
      { id: 'delegatedAmount', title: 'Total delegated' },
      { id: 'undelegated', title: 'Total undelegated' },
    ],
  });

  const bigNumbersToString = summary.map((s) => {
    return {
      address: s.address,
      delegatedAmount: s.delegatedAmount.toString(),
      stakedAmount: s.stakedAmount.toString(),
      undelegated: s.undelegated.toString(),
      userId: `${s.userId}`,
      email: s.email || 'unknown',
    };
  });

  await csvWriter
    .writeRecords(bigNumbersToString)
    .then(() => console.log(`Successfully wrote final analysis to ${filePath}`))
    .catch((error) => console.error(error));
  return filePath;
}
