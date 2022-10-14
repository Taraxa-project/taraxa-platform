import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionsIndex1665743100815 implements MigrationInterface {
  name = 'TransactionsIndex1665743100815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_6f30cde2f4cf5a630e05375840" ON "transactions" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79051061f6a7553a524383671d" ON "transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fdb5277f14e26e749075fcdd7" ON "transactions" ("to") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2fdb5277f14e26e749075fcdd7"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79051061f6a7553a524383671d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f30cde2f4cf5a630e05375840"`
    );
  }
}
