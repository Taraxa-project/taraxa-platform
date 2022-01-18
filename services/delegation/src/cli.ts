import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { NodeModule } from './modules/node/node.module';
import { NodeService } from './modules/node/node.service';
import { DelegationModule } from './modules/delegation/delegation.module';
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
  const app = await NestFactory.createApplicationContext(AppModule);
  const nodeService = app.select(NodeModule).get(NodeService, { strict: true });
  const delegationService = app
    .select(DelegationModule)
    .get(DelegationService, { strict: true });

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

  const testnetNodes = async () => {
    console.log(await nodes('testnet'));
  };

  const mainnetNodes = async () => {
    console.log(await nodes('mainnet'));
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
    ).argv;
  await app.close();
}
bootstrap();
