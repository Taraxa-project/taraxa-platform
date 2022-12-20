import { Command } from 'commander';
import { config } from 'dotenv';
import { BigNumber } from 'ethers';
import figlet from 'figlet';
import fs from 'fs';
import PostgresConnector from './database';
import { getAddressesWithPositiveStake, getCurrentStakes } from './stakes';
import {
  getUsersWithLowerDelegation,
  writeDelegationDataToCsv,
  writeFinalDelegationWarningsToCSV,
} from './stakeSummary';

config();

export const generationFolder = `${process.env.GENERATED_DEST_FOLDER}`;

async function ensureTargetFolder() {
  if (!fs.existsSync(generationFolder)) {
    fs.mkdirSync(generationFolder);
  }
}

async function main() {
  await ensureTargetFolder();
  const program = new Command();

  console.log(figlet.textSync('Taraxa Staking/Delegation Analysis'));

  program
    .version('1.0.0')
    .description('Scipt CLI for managing Taraxa relevant scripts')
    .option('-f, --first <first>', 'Number of staking events to retrieve', parseInt)
    .option('-s, --skip <skip>', 'Number of staking events to skip', parseInt)
    .option(
      '-f -s,--first <first> --skip <skip>',
      'Number of first stakes and number of staking events to skip',
      parseInt,
    )
    .parse(process.argv);

  const options = program.opts();

  if (options.first !== undefined && options.skip !== undefined) {
    const delegationConnection = new PostgresConnector(
      `${process.env.DELEGATION_HOST}`,
      Number(`${process.env.DELEGATION_PORT}`),
      `${process.env.DELEGATION_USER}`,
      `${process.env.DELEGATION_PASS}`,
      `${process.env.DELEGATION_DB}`,
    );
    const userDataConnection = new PostgresConnector(
      `${process.env.USERDATA_HOST}`,
      Number(`${process.env.USERDATA_PORT}`),
      `${process.env.USERDATA_USER}`,
      `${process.env.USERDATA_PASS}`,
      `${process.env.USERDATA_DB}`,
    );
    const filePath = await getCurrentStakes(Number(options.first), Number(options.skip));
    const usersWithStake = await getAddressesWithPositiveStake(filePath);
    const delegations = await delegationConnection.getDelegationsFromDatabase();
    await writeDelegationDataToCsv(delegations);
    const generatedUserWarnings = getUsersWithLowerDelegation(delegations, usersWithStake);
    await writeFinalDelegationWarningsToCSV(generatedUserWarnings, userDataConnection);
    const totalGlobalStake = generatedUserWarnings.reduce(
      (prev, next) => prev.add(next.stakedAmount),
      BigNumber.from('0'),
    );
    const totalGlobalDelegation = generatedUserWarnings.reduce(
      (prev, next) => prev.add(next.delegatedAmount),
      BigNumber.from('0'),
    );
    const totalGlobalUndelegated = totalGlobalStake.sub(totalGlobalDelegation);
    console.log(
      `Currently ${totalGlobalStake.toString()} is staked, from which ${totalGlobalDelegation.toString()} is delegated to TARA validators. ${totalGlobalUndelegated.toString()} is not delegated, consisting of ${totalGlobalUndelegated
        .mul(BigNumber.from('100'))
        .div(totalGlobalStake)
        .toString()} %`,
    );
    process.exit(0);
  } else {
    console.log(options);
    console.log('Please provide a value for both <first> and <skip>!');
  }
}
main();
