import { ITaraxaAddress } from 'src/models/Address.model';
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"
  `,
  materialized: true,
})
export class AddressEntity implements ITaraxaAddress {
  @ViewColumn()
  pubKey: string;

  @ViewColumn()
  transactionCount: number;

  @ViewColumn()
  balance: string;

  @ViewColumn()
  totalSent: string;

  @ViewColumn()
  totalReceived: string;

  @ViewColumn()
  totalMined: string;

  @ViewColumn()
  isContract: boolean;
}
