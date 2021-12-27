import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'validators',
  expression: `
  SELECT "id",
        "user",
        "name",
        "address",
        (
            SELECT "value"
            FROM "node_commissions" "nc"
            WHERE "nc"."nodeId" = "n"."id"
              AND "nc"."startsAt" > now()
            ORDER BY "startsAt" DESC
            LIMIT 1
        ) as "commission",
        (
            SELECT SUM("value")
            FROM "delegations" "d"
            WHERE "d"."nodeId" = "n"."id"
        ) as "delegation",
        (
          SELECT SUM("value")
          FROM "delegations" "d"
          WHERE "d"."nodeId" = "n"."id"
          AND "d"."user" = "n"."user"
        ) as "ownDelegation"
  FROM "nodes" "n"
  WHERE "n"."type" = 'mainnet'
  ORDER BY "delegation" ASC, "commission" ASC
  `,
})
export class Validator {
  @ViewColumn()
  id: number;

  @ViewColumn()
  user: number;

  @ViewColumn()
  address: string;

  @ViewColumn()
  commission: number;

  @ViewColumn()
  delegation: number;

  @ViewColumn()
  ownDelegation: number;
}
