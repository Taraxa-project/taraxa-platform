import { MigrationInterface, QueryRunner } from 'typeorm';

export class DagsIndexes1675691387681 implements MigrationInterface {
  name = 'DagsIndexes1675691387681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "dags_index_hash" ON "dags" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_level" ON "dags" ("level") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."dags_index_level"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_hash"`);
  }
}
