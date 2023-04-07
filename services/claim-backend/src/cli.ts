import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ClaimService } from './modules/claim/claim.service';

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

  await yargs(hideBin(process.argv)).command(
    'check-claims',
    'check all unclaimed claims and mark them as claimed',
    checkClaims,
  ).argv;

  await app.close();
}
bootstrap();
