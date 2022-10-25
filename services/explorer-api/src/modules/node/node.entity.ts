import { ITaraxaNode } from '@taraxa_project/explorer-shared';
import { ViewEntity, ViewColumn } from 'typeorm';

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
