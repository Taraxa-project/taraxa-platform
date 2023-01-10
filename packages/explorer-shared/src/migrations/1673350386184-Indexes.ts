import { MigrationInterface, QueryRunner } from 'typeorm';

export class Indexes1673350386184 implements MigrationInterface {
  name = 'Indexes1673350386184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "transactions_fk_block_id_pbfts_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "transactions_dags_fk_dags_id_dags_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "transactions_dags_fk_transactions_id_transactions_id"`
    );
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_number"`);
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_timestamp"`);
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_miner"`);
    await queryRunner.query(`DROP INDEX "public"."transactions_index_from"`);
    await queryRunner.query(`DROP INDEX "public"."transactions_index_to"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_pbft_period"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_timestamp"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_author"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_35a84f8058f83feff8f2941de6" ON "pbfts" ("hash") `
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
    await queryRunner.query(
      `CREATE INDEX "IDX_6f30cde2f4cf5a630e05375840" ON "transactions" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e11180855c1afd8fe21f96a1bf" ON "transactions" ("blockId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79051061f6a7553a524383671d" ON "transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fdb5277f14e26e749075fcdd7" ON "transactions" ("to") `
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
      `CREATE INDEX "IDX_be4644191d84fd783e820de183" ON "transactions_dags" ("dagsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92f89e03ca315be39f64d8ea64" ON "transactions_dags" ("transactionsId") `
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e11180855c1afd8fe21f96a1bf8" FOREIGN KEY ("blockId") REFERENCES "pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_be4644191d84fd783e820de1836" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_92f89e03ca315be39f64d8ea642" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_92f89e03ca315be39f64d8ea642"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_be4644191d84fd783e820de1836"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e11180855c1afd8fe21f96a1bf8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92f89e03ca315be39f64d8ea64"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be4644191d84fd783e820de183"`
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
      `DROP INDEX "public"."IDX_2fdb5277f14e26e749075fcdd7"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79051061f6a7553a524383671d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e11180855c1afd8fe21f96a1bf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f30cde2f4cf5a630e05375840"`
    );
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
      `DROP INDEX "public"."IDX_35a84f8058f83feff8f2941de6"`
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_author" ON "dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_timestamp" ON "dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_pbft_period" ON "dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "transactions_index_to" ON "transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE INDEX "transactions_index_from" ON "transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_miner" ON "pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_timestamp" ON "pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_number" ON "pbfts" ("number") `
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "transactions_dags_fk_transactions_id_transactions_id" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "transactions_dags_fk_dags_id_dags_id" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fk_block_id_pbfts_id" FOREIGN KEY ("blockId") REFERENCES "pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
