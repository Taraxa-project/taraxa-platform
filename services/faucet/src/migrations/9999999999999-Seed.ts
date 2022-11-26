import { MigrationInterface, QueryRunner } from 'typeorm';
import { IRequest } from '../models';

import RequestsJSON from './requests.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../../.env' });

export class Seed9999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await this.seedPools(queryRunner);
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('${prefix}requests', 'id'),
        (
            SELECT MAX("id")
            FROM ${prefix}requests
        )
      );`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<any> {}

  private async seedPools(queryRunner: QueryRunner) {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    const requestsTable = await queryRunner.getTable(`${prefix}requests`);

    if (!requestsTable) {
      console.log('requests table does not exist.');
      return;
    }

    await Promise.all(
      (RequestsJSON as unknown as IRequest[]).map(async (request) => {
        queryRunner.query(
          `INSERT INTO ${prefix}requests (
            "address", 
            "ip", 
            "txHash", 
            "amount" 
            ) VALUES (
              '${request.address}', 
              '${request.ip}', 
              '${request.txHash}', 
              '${request.amount}' 
            )`
        );
      })
    );
  }
}
