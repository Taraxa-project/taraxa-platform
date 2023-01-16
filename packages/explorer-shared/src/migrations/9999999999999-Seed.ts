/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../../.env' });

export class Seed9999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.${prefix}pbfts', 'id'),
        (
            SELECT MAX("id")
            FROM public.${prefix}pbfts
        )
    );`
    );
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.${prefix}dags', 'id'),
        (
            SELECT MAX("id")
            FROM public.${prefix}dags
        )
    );`
    );
    await queryRunner.query(
      `SELECT setval(
        pg_get_serial_sequence('public.${prefix}transactions', 'id'),
        (
            SELECT MAX("id")
            FROM public.${prefix}transactions
        )
    );`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
