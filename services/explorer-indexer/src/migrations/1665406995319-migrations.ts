import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1665406995319 implements MigrationInterface {
  name = 'migrations1665406995319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pbfts" ("hash" character varying NOT NULL, "number" integer NOT NULL, "timestamp" integer NOT NULL DEFAULT '0', "nonce" character varying, "miner" character varying, "gasLimit" bigint, "gasUsed" bigint, "parent" character varying, "difficulty" integer, "totalDifficulty" integer, "transactionCount" integer, CONSTRAINT "PK_35a84f8058f83feff8f2941de6a" PRIMARY KEY ("hash"))`
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
      `CREATE TABLE "transactions" ("hash" character varying NOT NULL, "nonce" integer, "index" integer, "value" integer, "gasPrice" bigint, "gas" bigint, "gasUsed" bigint, "cumulativeGasUsed" bigint, "inputData" character varying, "status" integer, "from" character varying, "to" character varying, "blockHash" character varying, CONSTRAINT "PK_6f30cde2f4cf5a630e053758400" PRIMARY KEY ("hash"))`
    );
    await queryRunner.query(
      `CREATE TABLE "dags" ("hash" character varying NOT NULL, "pivot" character varying, "tips" text, "level" integer, "pbftPeriod" integer, "timestamp" integer NOT NULL DEFAULT '0', "author" character varying, "signature" character varying, "vdf" integer, "transactionCount" integer, CONSTRAINT "PK_3928cee78a30b23a175d50796b2" PRIMARY KEY ("hash"))`
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
      `CREATE TABLE "transactions_dag_blocks_dags" ("transactionsHash" character varying NOT NULL, "dagsHash" character varying NOT NULL, CONSTRAINT "PK_74b72f912b4609854864281864b" PRIMARY KEY ("transactionsHash", "dagsHash"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c774a4c5c84a4dcceb90f1ba87" ON "transactions_dag_blocks_dags" ("transactionsHash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ba4511a63ded8fc4597118f30" ON "transactions_dag_blocks_dags" ("dagsHash") `
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_dd1fb8cdec958490ac0761b0540" FOREIGN KEY ("blockHash") REFERENCES "pbfts"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_c774a4c5c84a4dcceb90f1ba87a" FOREIGN KEY ("transactionsHash") REFERENCES "transactions"("hash") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_1ba4511a63ded8fc4597118f30f" FOREIGN KEY ("dagsHash") REFERENCES "dags"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`
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
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_1ba4511a63ded8fc4597118f30f"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_c774a4c5c84a4dcceb90f1ba87a"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_dd1fb8cdec958490ac0761b0540"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ba4511a63ded8fc4597118f30"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c774a4c5c84a4dcceb90f1ba87"`
    );
    await queryRunner.query(`DROP TABLE "transactions_dag_blocks_dags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_075334ad45632209ec978aa492"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b9638dca3a3c37b7f3cbc5da2"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95e9749d3714fff0524c436fc0"`
    );
    await queryRunner.query(`DROP TABLE "dags"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_365541c9f1664c4ec74fe276d8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0e582ceed9f80c0c656d9f8e1"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47649d1ebac5d5eed0222808ab"`
    );
    await queryRunner.query(`DROP TABLE "pbfts"`);
  }
}
