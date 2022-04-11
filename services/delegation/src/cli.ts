import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';

import { AppCoreModule } from './modules/app-core.module';
import { NodeService } from './modules/node/node.service';
import { DelegationService } from './modules/delegation/delegation.service';

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
  );
  await app.init();
  const nodeService = app.get(NodeService);
  const delegationService = app.get(DelegationService);

  const nodes = async (type: string) => {
    return nodeService.findNodes({ type });
  };

  const ensureDelegation = async (
    nodes: Node[],
    currentDelegations: Delegations,
  ) => {
    let count = 0;
    for (const node of nodes) {
      count++;
      const { id, type, address } = node;
      const currentDelegation = currentDelegations[address.toLowerCase()]
        ? parseInt(currentDelegations[address.toLowerCase()], 16)
        : 0;

      console.log(`${count} / ${nodes.length}: Rebalancing ${address}...`);
      console.log(`currentDelegation: ${currentDelegation}`);
      console.log(`ensuring delegation...`);
      await delegationService.ensureDelegation(id, type, address);
      console.log(`------------------------------`);
    }
  };

  const unDelegate = async (nodes: Node[], currentDelegations: Delegations) => {
    let count = 0;
    for (const node of nodes) {
      count++;
      const { type, address } = node;
      const currentDelegation = currentDelegations[address.toLowerCase()]
        ? parseInt(currentDelegations[address.toLowerCase()], 16)
        : 0;

      console.log(`${count} / ${nodes.length}: Rebalancing ${address}...`);
      console.log(`currentDelegation: ${currentDelegation}`);
      console.log(`removing delegation...`);
      await delegationService.unDelegateAll(type, address);
      console.log(`------------------------------`);
    }
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
    const n = await nodes('testnet');
    const currentDelegations = await delegationService.getDelegationsFor(
      'testnet',
    );
    await ensureDelegation(n, currentDelegations);
  };

  const mainnetEnsureDelegation = async () => {
    const n = await nodes('mainnet');
    const currentDelegations = await delegationService.getDelegationsFor(
      'mainnet',
    );
    await ensureDelegation(n, currentDelegations);
  };

  const testnetUndelegate = async () => {
    const n = await nodes('testnet');
    const currentDelegations = await delegationService.getDelegationsFor(
      'testnet',
    );
    await unDelegate(n, currentDelegations);
  };

  const mainnetUndelegate = async () => {
    const n = await nodes('mainnet');
    const currentDelegations = await delegationService.getDelegationsFor(
      'mainnet',
    );
    await unDelegate(n, currentDelegations);
  };

  const rebalanceTestnet = async () => {
    await delegationService.rebalanceTestnet();
    return Promise.resolve();
  };

  const rebalanceMainnet = async () => {
    await delegationService.rebalanceMainnet();
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
      'testnet-undelegate',
      'remove delegation from all testnet nodes',
      testnetUndelegate,
    )
    .command(
      'mainnet-undelegate',
      'remove delegation from all mainnet nodes',
      mainnetUndelegate,
    )
    .command(
      'rebalance-testnet',
      'rebalances own node delegations for testnet',
      rebalanceTestnet,
    )
    .command(
      'rebalance-mainnet',
      'rebalances own node delegations for mainnet',
      rebalanceMainnet,
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
    ).argv;
  await app.close();
}
bootstrap();
