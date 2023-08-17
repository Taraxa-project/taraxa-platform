import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BigNumber } from 'bignumber.js';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ClaimService } from './modules/claim/claim.service';
import { BatchTypes } from './modules/claim/type/batch-type';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  await app.init();
  const claimService = app.get(ClaimService);

  const checkClaims = async () => {
    const claims = await claimService.getUnclaimedClaims();
    let cnt = 0;
    for (const claim of claims) {
      cnt++;
      const { id, address } = claim;
      console.log(
        `${cnt} / ${claims.length}: Checking claim ${id} for ${address}...`,
      );
      console.log(claim);

      const isClaimed = await claimService.isClaimClaimed(claim);

      if (isClaimed) {
        console.log(`Is claimed. Marking as claimed...`);
        await claimService.markAsClaimed(claim);
      } else {
        console.log(`NOT claimed.`);
      }

      console.log(`------------------------------`);
    }
    console.log(`Total: ${cnt}/${claims.length}`);
    console.log(`------------------------------`);
  };

  const recalculateBalances = async () => {
    const accounts = await claimService.getAllAccounts();

    let cnt = 0;
    let missmatch = 0;
    for (const account of accounts) {
      cnt++;
      const { address } = account;

      console.log(
        `${cnt} / ${accounts.length}: Recalculating balance for account ${address}...`,
      );

      const available = new BigNumber(account.availableToBeClaimed);
      const claimed = new BigNumber(account.totalClaimed);
      const total = available.plus(claimed);

      const rewards = await claimService.getAccountRewards(account);
      const claims = await claimService.getAccountClaims(account);

      const totalRewards = rewards.reduce(
        (acc, reward) => acc.plus(reward.numberOfTokens),
        new BigNumber(0),
      );
      const totalClaimed = claims
        .filter((claim) => claim.claimed)
        .reduce(
          (acc, claim) => acc.plus(claim.numberOfTokens),
          new BigNumber(0),
        );

      if (
        totalRewards.eq(total) &&
        totalClaimed.eq(claimed) &&
        totalRewards.minus(totalClaimed).eq(available)
      ) {
        console.log(`No change. Skipping...`);
        continue;
      }
      missmatch++;
      console.log({
        totalRewards: totalRewards.toString(10),
        totalClaimed: totalRewards.toString(10),
      });
      console.log('account before', account);

      account.availableToBeClaimed = totalRewards
        .minus(totalClaimed)
        .toString(10);
      account.totalClaimed = totalClaimed.toString(10);

      // await claimService.saveAccount(account);

      console.log('account after', account);

      console.log(`------------------------------`);
    }

    console.log(`Total: ${cnt}/${accounts.length}`);
    console.log(`Missmatch: ${missmatch}/${accounts.length}`);
    console.log(`------------------------------`);
  };

  const createBatch = async (name: string) => {
    if (!name) {
      throw new Error('name is required');
    }
    console.log(`Creating batch "${name}"...`);
    const batch = await claimService.createBatch({
      name,
      type: BatchTypes.COMMUNITY_ACTIVITY,
    });

    console.log(`Created batch: ${batch.id}`);
    console.log(`------------------------------`);
  };

  const activateBatch = async (batchId: number) => {
    if (!batchId) {
      throw new Error('batchId is required');
    }
    console.log(`Activating batch ${batchId}...`);
    const batch = await claimService.batch(batchId);

    await claimService.patchBatch(batch.id, {
      isDraft: false,
    });
  };

  await yargs(hideBin(process.argv))
    .command(
      'create-batch [name]',
      'creates a new community activity batch',
      (yargs: Argv) => {
        yargs.positional('name', {
          type: 'string',
          describe: 'name of the batch',
        });
      },
      async (argv) => {
        return await createBatch(argv.name as string);
      },
    )
    .command(
      'activate-batch [batchId]',
      'marks a batch as not a draft and moves releases rewards',
      (yargs: Argv) => {
        yargs.positional('batchId', {
          type: 'number',
          describe: 'id of the batch',
        });
      },
      async (argv) => {
        return await activateBatch(argv.batchId as number);
      },
    )
    .command(
      'check-claims',
      'check all unclaimed claims and mark them as claimed',
      checkClaims,
    )
    .command(
      'recalculate-balances',
      'recalculate balances for all addresses and remove all claims for batch',
      recalculateBalances,
    ).argv;

  await app.close();
}
bootstrap();
