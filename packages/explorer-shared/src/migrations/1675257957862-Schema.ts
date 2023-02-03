import { MigrationInterface, QueryRunner } from 'typeorm';

export class Schema1675257957862 implements MigrationInterface {
  name = 'Schema1675257957862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pbfts" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "number" integer NOT NULL, "timestamp" integer NOT NULL DEFAULT '0', "nonce" character varying, "miner" character varying, "reward" character varying, "gasLimit" character varying, "gasUsed" character varying, "parent" character varying, "difficulty" integer, "totalDifficulty" integer, "transactionCount" integer, "transactionsRoot" character varying, "extraData" character varying, "logsBloom" character varying, "mixHash" character varying, "recepitsRoot" character varying, "sha3Uncles" character varying, "size" integer, "stateRoot" character varying, CONSTRAINT "UQ_35a84f8058f83feff8f2941de6a" UNIQUE ("hash"), CONSTRAINT "PK_6f76845d0ce6ec5233cc8eab5e6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_hash" ON "pbfts" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_number" ON "pbfts" ("number") `
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_timestamp" ON "pbfts" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "pbfts_index_miner" ON "pbfts" ("miner") `
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "nonce" integer, "index" integer, "value" character varying, "gasPrice" character varying, "gas" character varying, "gasUsed" character varying, "cumulativeGasUsed" integer, "inputData" character varying, "status" integer, "from" character varying, "to" character varying, "v" character varying, "r" character varying, "s" character varying, "blockHash" character varying, "blockNumber" integer, "blockTimestamp" integer, "blockId" integer, CONSTRAINT "UQ_6f30cde2f4cf5a630e053758400" UNIQUE ("hash"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "transactions_index_hash" ON "transactions" ("hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "transactions_index_blockId" ON "transactions" ("blockId") `
    );
    await queryRunner.query(
      `CREATE INDEX "transactions_index_from" ON "transactions" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "transactions_index_to" ON "transactions" ("to") `
    );
    await queryRunner.query(
      `CREATE TABLE "dags" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "pivot" character varying, "tips" text, "level" integer, "pbftPeriod" integer, "timestamp" integer NOT NULL DEFAULT '0', "author" character varying, "signature" character varying, "vdf" integer, "transactionCount" integer, CONSTRAINT "UQ_3928cee78a30b23a175d50796b2" UNIQUE ("hash"), CONSTRAINT "PK_e5bdea0a5a07a8377a7c0bc9432" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_pbftPeriod" ON "dags" ("pbftPeriod") `
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_timestamp" ON "dags" ("timestamp") `
    );
    await queryRunner.query(
      `CREATE INDEX "dags_index_author" ON "dags" ("author") `
    );
    await queryRunner.query(
      `CREATE TABLE "transactions_dags" ("dagsId" integer NOT NULL, "transactionsId" integer NOT NULL, CONSTRAINT "PK_fb911dc85a26a8f7b109f615c61" PRIMARY KEY ("dagsId", "transactionsId"))`
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
    await queryRunner.query(`CREATE VIEW "node_entity" AS 
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'node_entity',
        'SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"',
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'node_entity', 'public']
    );
    await queryRunner.query(`DROP VIEW "node_entity"`);
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
    await queryRunner.query(`DROP TABLE "transactions_dags"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_author"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_timestamp"`);
    await queryRunner.query(`DROP INDEX "public"."dags_index_pbftPeriod"`);
    await queryRunner.query(`DROP TABLE "dags"`);
    await queryRunner.query(`DROP INDEX "public"."transactions_index_to"`);
    await queryRunner.query(`DROP INDEX "public"."transactions_index_from"`);
    await queryRunner.query(`DROP INDEX "public"."transactions_index_blockId"`);
    await queryRunner.query(`DROP INDEX "public"."transactions_index_hash"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_miner"`);
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_timestamp"`);
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_number"`);
    await queryRunner.query(`DROP INDEX "public"."pbfts_index_hash"`);
    await queryRunner.query(`DROP TABLE "pbfts"`);
  }
}
