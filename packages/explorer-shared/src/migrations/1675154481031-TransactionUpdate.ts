import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionUpdate1675154481031 implements MigrationInterface {
  name = 'TransactionUpdate1675154481031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD "blockTimestamp" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP COLUMN "blockNumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD "blockNumber" integer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP COLUMN "blockNumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD "blockNumber" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP COLUMN "blockTimestamp"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD "transactionIndex" character varying`
    );
  }
}
