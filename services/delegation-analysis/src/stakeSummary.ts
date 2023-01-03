/* eslint-disable no-restricted-syntax */
import chalk from 'chalk';
import { createObjectCsvWriter } from 'csv-writer';
import { BigNumber } from 'ethers';
import { runtimeConfig } from './config';
import PostgresConnector from './database';
import { DelegationData, DelegationWarning, StakingSummary } from './types';

export function getUsersWithLowerDelegation(
  delegations: DelegationData[],
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
      const isDelegationLower = BigNumber.from(matchingDelegation.value).lt(summary.finalStakes);
      undelegationSummary.undelegated = isDelegationLower
        ? summary.finalStakes.sub(matchingDelegation.value)
        : summary.finalStakes;
      undelegationSummary.delegatedAmount = BigNumber.from(matchingDelegation.value);
      undelegationSummary.userId = matchingDelegation.user;

      const msg = `Address ${
        summary.user
      } has stake of ${summary.finalStakes.toString()} and delegation of ${
        matchingDelegation.value
      }`;
      console.log(isDelegationLower ? chalk.blue(msg) : chalk.gray(msg));
    } else {
      console.log(chalk.yellow(`No delegation found for staker ${summary.user}`));
      undelegationSummary.delegatedAmount = BigNumber.from('0');
      undelegationSummary.undelegated = summary.finalStakes;
      undelegationSummary.userId = '-1'; // meaning there is no undelegation
    }
    undelegationSummary.stakedAmount = summary.finalStakes;
    undelegationSummary.address = summary.user;
    result.push(undelegationSummary);
  });
  console.log(`${result.length} users had lower delegation than stake!`);
  return result;
}

export async function writeDelegationDataToCsv(delegations: DelegationData[]) {
  const filePath = `${runtimeConfig.outputDir}/delegations-${new Date().getTime().toFixed(0)}.csv`;

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
    .then(() => console.log(chalk.green(`Successfully wrote delegations to ${filePath}`)))
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
      console.log(chalk.green(`Found ${finalValues.email} for user ${finalValues.address}`));
    }
  }

  const filePath = `${runtimeConfig.outputDir}/undelegation-warnings-${new Date()
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
