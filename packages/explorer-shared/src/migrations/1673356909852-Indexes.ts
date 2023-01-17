import { MigrationInterface, QueryRunner } from 'typeorm';

export class Indexes1673356909852 implements MigrationInterface {
  name = 'Indexes1673356909852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}transactions_dags_fk_${prefix}dags_id_dags_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}transactions_dags_fk_${prefix}transactions_id_transactions_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}pbfts_index_number"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}pbfts_index_timestamp"`
    );
    await queryRunner.query(`DROP INDEX "public"."${prefix}pbfts_index_miner"`);
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_index_from"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_index_to"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}dags_index_pbft_period"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}dags_index_timestamp"`
    );
    await queryRunner.query(`DROP INDEX "public"."${prefix}dags_index_author"`);
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_hash" ON "${prefix}pbfts" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_number" ON "${prefix}pbfts" ("number") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_timestamp" ON "${prefix}pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_miner" ON "${prefix}pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_hash" ON "${prefix}transactions" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_blockId" ON "${prefix}transactions" ("blockId") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_from" ON "${prefix}transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_to" ON "${prefix}transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_pbftPeriod" ON "${prefix}dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_timestamp" ON "${prefix}dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_author" ON "${prefix}dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_dags_index_transactionsId" ON "${prefix}transactions_dags" ("transactionsId") `
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "${prefix}FK_e11180855c1afd8fe21f96a1bf8" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}FK_be4644191d84fd783e820de1836" FOREIGN KEY ("dagsId") REFERENCES "${prefix}dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}FK_92f89e03ca315be39f64d8ea642" FOREIGN KEY ("transactionsId") REFERENCES "${prefix}transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}FK_92f89e03ca315be39f64d8ea642"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}FK_be4644191d84fd783e820de1836"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "${prefix}FK_e11180855c1afd8fe21f96a1bf8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_dags_index_transactionsId"`
    );
    await queryRunner.query(`DROP INDEX "public"."${prefix}dags_index_author"`);
    await queryRunner.query(
      `DROP INDEX "public".""${prefix}dags_index_timestamp"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}dags_index_pbftPeriod"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_index_to"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_index_from"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_index_blockId"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}transactions_index_hash"`
    );
    await queryRunner.query(`DROP INDEX "public"."${prefix}pbfts_index_miner"`);
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}pbfts_index_timestamp"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."${prefix}pbfts_index_number"`
    );
    await queryRunner.query(`DROP INDEX "public"."${prefix}pbfts_index_hash"`);
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}transactions_dags_fk_${prefix}transactions_id_transactions_id" FOREIGN KEY ("transactionsId") REFERENCES "${prefix}transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}transactions_dags_fk_${prefix}dags_id_dags_id" FOREIGN KEY ("dagsId") REFERENCES "${prefix}dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "${prefix}transactions_fk_${prefix}transactions_id_transactions_id" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
