/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../../.env' });

export class Seed9999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.pbfts', 'id'),
        (
            SELECT MAX("id")
            FROM public.pbfts
        )
    );`
    );
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.dags', 'id'),
        (
            SELECT MAX("id")
            FROM public.dags
        )
    );`
    );
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.transactions', 'id'),
        (
            SELECT MAX("id")
            FROM public.transactions
        )
    );`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
