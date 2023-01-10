import { MigrationInterface, QueryRunner } from 'typeorm';

export class indexesDevnet1673350890237 implements MigrationInterface {
  name = 'indexesDevnet1673350890237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(
    //   `DELETE FROM "devnet_typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
    //   ['VIEW', 'devnet_node_entity', 'public']
    // );
    // await queryRunner.query(`DROP VIEW "devnet_node_entity"`);
    // await queryRunner.query(
    //   `ALTER TABLE "devnet_transactions" DROP CONSTRAINT "devnet_transactions_fk_block_id_devnet_pbfts_id"`
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "devnet_transactions_dags" DROP CONSTRAINT "devnet_transactions_dags_fk_devnet_dags_id_dags_id"`
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "devnet_transactions_dags" DROP CONSTRAINT "devnet_transactions_dags_fk_devnet_transactions_id_transactions"`
    // );
    // await queryRunner.query(`DROP INDEX "public"."devnet_pbfts_index_number"`);
    // await queryRunner.query(
    //   `DROP INDEX "public"."devnet_pbfts_index_timestamp"`
    // );
    await queryRunner.query(`DROP INDEX "public"."devnet_pbfts_index_miner"`);
    await queryRunner.query(
      `DROP INDEX "public"."devnet_transactions_index_from"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."devnet_transactions_index_to"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."devnet_dags_index_pbft_period"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."devnet_dags_index_timestamp"`
    );
    await queryRunner.query(`DROP INDEX "public"."devnet_dags_index_author"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_f453df3932ee9a87389260cac9" ON "devnet_pbfts" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ac86a31d63f79a60c90ac7054" ON "devnet_pbfts" ("number") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c32eeef210a701c5d75a6c3afa" ON "devnet_pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95d7a501c5f3558dca34b35041" ON "devnet_pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c44fa5687345b5d9802991e070" ON "devnet_transactions" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_faf59d5a998e3df7761ac55508" ON "devnet_transactions" ("blockId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_608f95d393b6111f2f093eb012" ON "devnet_transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_26469e1d27c118172f1e389143" ON "devnet_transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_40d5abde8ec96c8e59b5276ac4" ON "devnet_dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_11e99e3a9a4f9a3a31afab8bc3" ON "devnet_dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d1f387369a203586a92fa5136" ON "devnet_dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_23feee1ebd642e786df1937de6" ON "devnet_transactions_dags" ("dagsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_762b1c7fa14a667664b55d4b89" ON "devnet_transactions_dags" ("transactionsId") `
    );
    // await queryRunner.query(
    //   `ALTER TABLE "devnet_transactions" ADD CONSTRAINT "FK_faf59d5a998e3df7761ac55508c" FOREIGN KEY ("blockId") REFERENCES "devnet_pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "devnet_transactions_dags" ADD CONSTRAINT "FK_23feee1ebd642e786df1937de68" FOREIGN KEY ("dagsId") REFERENCES "devnet_dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "devnet_transactions_dags" ADD CONSTRAINT "FK_762b1c7fa14a667664b55d4b89d" FOREIGN KEY ("transactionsId") REFERENCES "devnet_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    // );
    await queryRunner.query(`CREATE VIEW "devnet_node_entity" AS 
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"
  `);
    await queryRunner.query(
      `INSERT INTO "devnet_typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'devnet_node_entity',
        'SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"',
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "devnet_typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'devnet_node_entity', 'public']
    );
    await queryRunner.query(`DROP VIEW "devnet_node_entity"`);
    await queryRunner.query(
      `ALTER TABLE "devnet_transactions_dags" DROP CONSTRAINT "FK_762b1c7fa14a667664b55d4b89d"`
    );
    await queryRunner.query(
      `ALTER TABLE "devnet_transactions_dags" DROP CONSTRAINT "FK_23feee1ebd642e786df1937de68"`
    );
    await queryRunner.query(
      `ALTER TABLE "devnet_transactions" DROP CONSTRAINT "FK_faf59d5a998e3df7761ac55508c"`
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
      `CREATE INDEX "devnet_dags_index_author" ON "devnet_dags" ("author") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_dags_index_timestamp" ON "devnet_dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_dags_index_pbft_period" ON "devnet_dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_transactions_index_to" ON "devnet_transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_transactions_index_from" ON "devnet_transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_pbfts_index_miner" ON "devnet_pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_pbfts_index_timestamp" ON "devnet_pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "devnet_pbfts_index_number" ON "devnet_pbfts" ("number") `
    );
    await queryRunner.query(
      `ALTER TABLE "devnet_transactions_dags" ADD CONSTRAINT "devnet_transactions_dags_fk_devnet_transactions_id_transactions" FOREIGN KEY ("transactionsId") REFERENCES "devnet_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "devnet_transactions_dags" ADD CONSTRAINT "devnet_transactions_dags_fk_devnet_dags_id_dags_id" FOREIGN KEY ("dagsId") REFERENCES "devnet_dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "devnet_transactions" ADD CONSTRAINT "devnet_transactions_fk_block_id_devnet_pbfts_id" FOREIGN KEY ("blockId") REFERENCES "devnet_pbfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `CREATE VIEW "devnet_node_entity" AS SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "devnet_pbfts" GROUP BY "miner"`
    );
    await queryRunner.query(
      `INSERT INTO "devnet_typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'devnet_node_entity',
        'SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "devnet_pbfts" GROUP BY "miner"',
      ]
    );
  }
}
