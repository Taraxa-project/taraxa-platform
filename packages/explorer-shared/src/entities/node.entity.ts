import { ViewEntity, ViewColumn } from 'typeorm';
import { ITaraxaNode } from '../models';

@ViewEntity({
  expression: `
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"
  `,
})
export class NodeEntity implements ITaraxaNode {
  @ViewColumn()
  address: string;

  @ViewColumn()
  pbftCount: number;
}
