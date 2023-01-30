import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT t.from AS "address", SUM(value::decimal) as "totalSent" FROM "transactions" t GROUP BY t.from
  `,
  materialized: true,
})
export class AddressTotalSentEntity {
  @ViewColumn()
  totalSent: string;

  @ViewColumn()
  address: string;
}

@ViewEntity({
  expression: `
    SELECT t.to AS "address", SUM(value::decimal) as "totalSent" FROM "transactions" t GROUP BY t.to
  `,
  materialized: true,
})
export class AddressTotalReceivedEntity {
  @ViewColumn()
  totalSent: string;

  @ViewColumn()
  address: string;
}

@ViewEntity({
  expression: `
    SELECT miner AS "address", SUM(reward::decimal) as "totalMined" FROM "pbfts" GROUP BY miner
  `,
  materialized: true,
})
export class AddressTotalMinedEntity {
  @ViewColumn()
  totalMined: string;

  @ViewColumn()
  address: string;
}

@ViewEntity({
  expression: `
    SELECT t.from, t.to, COUNT(*) as total FROM "transactions" t GROUP BY t.from, t.to
  `,
  materialized: true,
})
export class AddressTotalTxEntity {
  @ViewColumn()
  total: string;

  @ViewColumn()
  from: string;

  @ViewColumn()
  to: string;
}
