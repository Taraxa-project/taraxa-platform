import { ITaraxaNode } from '@taraxa_project/taraxa-models';
import { MigrationInterface, QueryRunner } from 'typeorm';

import NodesJSON from './nodes.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../../.env' });

export class Seed9999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await this.seedNodes(queryRunner);
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.explorer_node', 'id'),
        (
            SELECT MAX("id")
            FROM public.explorer_node
        ) + 1
    );`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<any> {}

  private async seedNodes(queryRunner: QueryRunner) {
    const nodeTable = await queryRunner.getTable('public.explorer_node');

    if (!nodeTable) {
      console.log('explorer_node table does not exist.');
      return;
    }

    await Promise.all(
      (NodesJSON as unknown as ITaraxaNode[]).map(async (node) => {
        queryRunner.query(
          `INSERT INTO public.explorer_node (
            "address", 
            "lastBlockNumber", 
            "pbftCount", 
            "dagCount"
            ) VALUES (
              '${node.address}', 
              '${node.lastBlockNumber}', 
              '${node.pbftCount}', 
              '${node.dagCount}'
            )`
        );
      })
    );
  }
}
