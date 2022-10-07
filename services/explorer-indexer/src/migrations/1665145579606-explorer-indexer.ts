import { MigrationInterface, QueryRunner } from 'typeorm';

export class explorerIndexer1665145579606 implements MigrationInterface {
  name = 'explorerIndexer1665145579606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_829a4b7720d6e52787733c8bf4" ON "explorer_node" ("address") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba0e2b341d848bd1c8d4d07c5" ON "explorer_node" ("pbftCount") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d073f0052ee04b6e1b78ba770d" ON "explorer_node" ("dagCount") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95e9749d3714fff0524c436fc0" ON "dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b9638dca3a3c37b7f3cbc5da2" ON "dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_075334ad45632209ec978aa492" ON "dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47649d1ebac5d5eed0222808ab" ON "pbfts" ("number") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0e582ceed9f80c0c656d9f8e1" ON "pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_365541c9f1664c4ec74fe276d8" ON "pbfts" ("miner") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_365541c9f1664c4ec74fe276d8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0e582ceed9f80c0c656d9f8e1"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47649d1ebac5d5eed0222808ab"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_075334ad45632209ec978aa492"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b9638dca3a3c37b7f3cbc5da2"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95e9749d3714fff0524c436fc0"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d073f0052ee04b6e1b78ba770d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dba0e2b341d848bd1c8d4d07c5"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_829a4b7720d6e52787733c8bf4"`
    );
  }
}
