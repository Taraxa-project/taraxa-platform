import chalk from 'chalk';
import { Command } from 'commander';
import { BigNumber } from 'ethers';
import figlet from 'figlet';
import fs from 'fs';
import { databaseConfig, runtimeConfig } from './config';
import PostgresConnector from './database';
import { getAddressesWithPositiveStake, getCurrentStakes } from './stakes';
import {
  getUsersWithLowerDelegation,
  writeDelegationDataToCsv,
  writeFinalDelegationWarningsToCSV,
} from './stakeSummary';

async function ensureTargetFolder() {
  if (!fs.existsSync(runtimeConfig.outputDir)) {
    fs.mkdirSync(runtimeConfig.outputDir);
  }
}

async function main() {
  await ensureTargetFolder();
  const program = new Command();

  console.log(figlet.textSync('Taraxa Staking/Delegation'));

  program
    .version('1.0.0')
    .description(chalk.green('Scipt CLI for managing Taraxa relevant scripts'))
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
      databaseConfig.delegationHost,
      databaseConfig.delegationPort,
      databaseConfig.delegationUser,
      databaseConfig.delegationPassword,
      databaseConfig.delegationDatabase,
    );
    const userDataConnection = new PostgresConnector(
      databaseConfig.taraxaProdHost,
      databaseConfig.taraxaProdPort,
      databaseConfig.taraxaProdUser,
      databaseConfig.taraxaProdPassword,
      databaseConfig.taraxaProdDatabase,
    );
    const filePath = await getCurrentStakes(Number(options.first), Number(options.skip));
    const usersWithStake = await getAddressesWithPositiveStake(filePath);
    const delegations = await delegationConnection.getDelegationsFromDatabase();
    await writeDelegationDataToCsv(delegations);
    const generatedUserWarnings = getUsersWithLowerDelegation(delegations, usersWithStake);
    await writeFinalDelegationWarningsToCSV(generatedUserWarnings, userDataConnection);

    const totalGlobalStake = usersWithStake.reduce(
      (prev, next) => prev.add(next.finalStakes),
      BigNumber.from('0'),
    );
    const totalGlobalDelegation = delegations.reduce(
      (prev, next) => prev.add(next.value),
      BigNumber.from('0'),
    );
    const totalGlobalUndelegated = totalGlobalStake.sub(totalGlobalDelegation);
    console.log(
      chalk.magenta(
        `Currently ${totalGlobalStake.toString()} is staked, from which ${totalGlobalDelegation.toString()} is delegated to TARA validators. ${totalGlobalUndelegated.toString()} is not delegated, consisting of ${totalGlobalUndelegated
          .mul(BigNumber.from('100'))
          .div(totalGlobalStake)
          .toString()} % of the total value staked.`,
      ),
    );
    process.exit(0);
  } else {
    console.log(options);
    console.log(chalk.red('Please provide a value for both <first> and <skip>!'));
  }
}
main();
