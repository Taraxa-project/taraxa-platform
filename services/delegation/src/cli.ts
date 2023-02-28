import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';

import { AppCoreModule } from './modules/app-core.module';
import { NodeService } from './modules/node/node.service';
import { DelegationService } from './modules/delegation/delegation.service';
import { RewardService } from './modules/reward/reward.service';
import {
  BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
  BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
} from './modules/blockchain/blockchain.constant';

interface Node {
  id: number;
  type: string;
  address: string;
}

interface Delegations {
  [address: string]: string;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    AppCoreModule.forRoot(),
    {
      logger: ['error', 'warn'],
    },
  );
  await app.init();
  const nodeService = app.get(NodeService);
  const delegationService = app.get(DelegationService);
  const rewardService = app.get(RewardService);
  const testnetBlockchainService = app.get(BLOCKCHAIN_TESTNET_INSTANCE_TOKEN);
  const mainnetBlockchainService = app.get(BLOCKCHAIN_MAINNET_INSTANCE_TOKEN);

  const nodes = async (type: string) => {
    return nodeService.findNodes({ type });
  };

  const testnetNodes = async () => {
    console.log(await nodes('testnet'));
    return Promise.resolve();
  };

  const mainnetNodes = async () => {
    console.log(await nodes('mainnet'));
    return Promise.resolve();
  };

  const testnetEnsureDelegation = async () => {
    const nodes = await nodeService.findAllTestnetNodes();
    let count = 0;
    for (const node of nodes) {
      count++;
      const { id, type, address, deletedAt } = node;
      const isDeleted = deletedAt !== null;
      console.log(`${count} / ${nodes.length}: Rebalancing ${address}...`);
      console.log(`ensuring delegation...`);
      console.log(`Deleted: ${isDeleted ? 'Y' : 'N'}`);
      try {
        const validator = await testnetBlockchainService.getValidator(address);
        console.log(`currentDelegation: ${validator.total_stake.toString()}`);
        console.log({
          validator,
        });
      } catch (e) {
        console.log(`Node isn't registered as a validator.`);
      }
      await delegationService.ensureDelegation(id, type, address);
      console.log(`------------------------------`);
    }
  };

  const mainnetEnsureDelegation = async () => {
    const nodes = await nodeService.findAllMainnetNodes();
    let count = 0;
    for (const node of nodes) {
      count++;
      const { id, type, address, deletedAt } = node;
      const isDeleted = deletedAt !== null;
      console.log(`${count} / ${nodes.length}: Rebalancing ${address}...`);
      console.log(`ensuring delegation...`);
      console.log(`Deleted: ${isDeleted ? 'Y' : 'N'}`);
      try {
        const validator = await mainnetBlockchainService.getValidator(address);
        console.log(`currentDelegation: ${validator.total_stake.toString()}`);
      } catch (e) {
        console.log(`Node isn't registered as a validator.`);
      }
      await delegationService.ensureDelegation(id, type, address);
      console.log(`------------------------------`);
    }
  };

  const rebalanceMainnet = async () => {
    await mainnetBlockchainService.rebalanceOwnNodes();
    return Promise.resolve();
  };

  const rebalanceTestnet = async () => {
    await testnetBlockchainService.rebalanceOwnNodes();
    return Promise.resolve();
  };

  const checkStaking = async () => {
    const delegators = await delegationService.getDelegators();
    let cnt = 0;
    for (const delegator of delegators) {
      const { address } = delegator;
      const balances = await delegationService.getBalances(address);

      if (balances.delegated > balances.total) {
        cnt++;
        console.log(`Checking ${address}...`);
        console.log(`currentStake: ${balances.total}`);
        console.log(`currentDelegated: ${balances.delegated}`);
        console.log(`------------------------------`);
      }
    }
    console.log(`Total: ${cnt}/${delegators.length}`);
    console.log(`------------------------------`);
    return Promise.resolve();
  };

  const rebalanceStaking = async () => {
    const delegators = await delegationService.getDelegators();
    let cnt = 0;
    for (const delegator of delegators) {
      const { address } = delegator;
      const balances = await delegationService.getBalances(address);

      if (balances.delegated > balances.total) {
        cnt++;
        const diff = balances.delegated - balances.total;
        console.log(`Checking ${address}...`);
        console.log(`currentStake: ${balances.total}`);
        console.log(`currentDelegated: ${balances.delegated}`);
        console.log(`diff: ${diff}`);
        console.log(`Rebalancing...`);
        await delegationService.undelegate(address, diff);
        console.log(`------------------------------`);
      }
    }
    console.log(`Total: ${cnt}/${delegators.length}`);
    console.log(`------------------------------`);
  };

  const calculateRewards = async () => {
    await rewardService.calculateRewards();
    return Promise.resolve();
  };

  const calculateRewardsForEpoch = async (epoch: number) => {
    await rewardService.calculateRewardsForEpoch(epoch);
    return Promise.resolve();
  };

  await yargs(hideBin(process.argv))
    .command('testnet-nodes', 'get all testnet nodes', testnetNodes)
    .command('mainnet-nodes', 'get all mainnets nodes', mainnetNodes)
    .command(
      'testnet-ensure-delegation',
      'ensure delegation for all testnet nodes',
      testnetEnsureDelegation,
    )
    .command(
      'mainnet-ensure-delegation',
      'ensure delegation for all mainnet nodes',
      mainnetEnsureDelegation,
    )
    .command(
      'rebalance-mainnet',
      'rebalances own node delegations for mainnet',
      rebalanceMainnet,
    )
    .command(
      'rebalance-testnet',
      'rebalances own node delegations for testnet',
      rebalanceTestnet,
    )
    .command(
      'check-staking',
      'checks staking balances for all addresses',
      checkStaking,
    )
    .command(
      'rebalance-staking',
      "undelegates from all addresses that don't have enough stake",
      rebalanceStaking,
    )
    .command(
      'calculate-rewards',
      'calculates rewards for all nodes/delegators',
      calculateRewards,
    )
    .command(
      'calculate-rewards-for-epoch [epoch]',
      'calculates rewards for all nodes/delegators for a specific epoch',
      (yargs: Argv) => {
        yargs.positional('epoch', {
          type: 'number',
          describe: 'epoch',
        });
      },
      async (argv) => {
        return await calculateRewardsForEpoch(argv.epoch as number);
      },
    ).argv;
  await app.close();
}
bootstrap();
