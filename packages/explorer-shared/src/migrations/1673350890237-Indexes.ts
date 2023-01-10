import { MigrationInterface, QueryRunner } from 'typeorm';

export class Indexes1673350890237 implements MigrationInterface {
  name = 'Indexes1673350890237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `DELETE FROM "${prefix}typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', `${prefix}node_entity`, 'public']
    );
    await queryRunner.query(`DROP VIEW "${prefix}node_entity"`);
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}transactions_dags_fk_${prefix}dags_id_dags_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}transactions_dags_fk_${prefix}transactions_id_transactions"`
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
      `CREATE INDEX "IDX_f453df3932ee9a87389260cac9" ON "${prefix}pbfts" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ac86a31d63f79a60c90ac7054" ON "${prefix}pbfts" ("number") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c32eeef210a701c5d75a6c3afa" ON "${prefix}pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95d7a501c5f3558dca34b35041" ON "${prefix}pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c44fa5687345b5d9802991e070" ON "${prefix}transactions" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_faf59d5a998e3df7761ac55508" ON "${prefix}transactions" ("blockId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_608f95d393b6111f2f093eb012" ON "${prefix}transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_26469e1d27c118172f1e389143" ON "${prefix}transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_40d5abde8ec96c8e59b5276ac4" ON "${prefix}dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_11e99e3a9a4f9a3a31afab8bc3" ON "${prefix}dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d1f387369a203586a92fa5136" ON "${prefix}dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_23feee1ebd642e786df1937de6" ON "${prefix}transactions_dags" ("dagsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_762b1c7fa14a667664b55d4b89" ON "${prefix}transactions_dags" ("transactionsId") `
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "FK_faf59d5a998e3df7761ac55508c" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "FK_23feee1ebd642e786df1937de68" FOREIGN KEY ("dagsId") REFERENCES "${prefix}dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "FK_762b1c7fa14a667664b55d4b89d" FOREIGN KEY ("transactionsId") REFERENCES "${prefix}transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(`CREATE VIEW "${prefix}node_entity" AS 
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "${prefix}pbfts" GROUP BY "miner"
  `);
    await queryRunner.query(
      `INSERT INTO "${prefix}typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        `${prefix}node_entity`,
        `SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "${prefix}pbfts" GROUP BY "miner"`,
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `DELETE FROM "${prefix}typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', `${prefix}node_entity`, 'public']
    );
    await queryRunner.query(`DROP VIEW "${prefix}node_entity"`);
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "FK_762b1c7fa14a667664b55d4b89d"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "FK_23feee1ebd642e786df1937de68"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "FK_faf59d5a998e3df7761ac55508c"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_762b1c7fa14a667664b55d4b89"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_23feee1ebd642e786df1937de6"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d1f387369a203586a92fa5136"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_11e99e3a9a4f9a3a31afab8bc3"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40d5abde8ec96c8e59b5276ac4"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_26469e1d27c118172f1e389143"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_608f95d393b6111f2f093eb012"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_faf59d5a998e3df7761ac55508"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c44fa5687345b5d9802991e070"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95d7a501c5f3558dca34b35041"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c32eeef210a701c5d75a6c3afa"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ac86a31d63f79a60c90ac7054"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f453df3932ee9a87389260cac9"`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_author" ON "${prefix}dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_timestamp" ON "${prefix}dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_pbft_period" ON "${prefix}dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_to" ON "${prefix}transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_from" ON "${prefix}transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_miner" ON "${prefix}pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_timestamp" ON "${prefix}pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_number" ON "${prefix}pbfts" ("number") `
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}transactions_dags_fk_${prefix}transactions_id_transactions" FOREIGN KEY ("transactionsId") REFERENCES "${prefix}transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}transactions_dags_fk_${prefix}dags_id_dags_id" FOREIGN KEY ("dagsId") REFERENCES "${prefix}dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `CREATE VIEW "${prefix}node_entity" AS SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "${prefix}pbfts" GROUP BY "miner"`
    );
    await queryRunner.query(
      `INSERT INTO "${prefix}typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        `${prefix}node_entity`,
        `SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "${prefix}pbfts" GROUP BY "miner"`,
      ]
    );
  }
}
