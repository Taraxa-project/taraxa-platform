import { MigrationInterface, QueryRunner } from 'typeorm';

export class src1665662409036 implements MigrationInterface {
  name = 'src1665662409036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dags" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "pivot" character varying, "tips" text, "level" integer, "pbftPeriod" integer, "timestamp" integer NOT NULL DEFAULT '0', "author" character varying, "signature" character varying, "vdf" integer, "transactionCount" integer, CONSTRAINT "UQ_3928cee78a30b23a175d50796b2" UNIQUE ("hash"), CONSTRAINT "PK_e5bdea0a5a07a8377a7c0bc9432" PRIMARY KEY ("id"))`
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
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "nonce" integer, "index" integer, "value" character varying, "gasPrice" character varying, "gas" character varying, "gasUsed" character varying, "cumulativeGasUsed" integer, "inputData" character varying, "status" integer, "from" character varying, "to" character varying, "v" character varying, "r" character varying, "s" character varying, "blockHash" character varying, "blockNumber" character varying, "input" character varying, "transactionIndex" character varying, "blockId" integer, CONSTRAINT "UQ_6f30cde2f4cf5a630e053758400" UNIQUE ("hash"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pbfts" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "number" integer NOT NULL, "timestamp" integer NOT NULL DEFAULT '0', "nonce" character varying, "miner" character varying, "reward" character varying, "gasLimit" character varying, "gasUsed" character varying, "parent" character varying, "difficulty" integer, "totalDifficulty" integer, "transactionCount" integer, "transactionsRoot" character varying, "extraData" character varying, "logsBloom" character varying, "mixHash" character varying, "recepitsRoot" character varying, "sha3Uncles" character varying, "size" integer, "stateRoot" character varying, CONSTRAINT "UQ_35a84f8058f83feff8f2941de6a" UNIQUE ("hash"), CONSTRAINT "PK_6f76845d0ce6ec5233cc8eab5e6" PRIMARY KEY ("id"))`
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
      `CREATE TABLE "transactions_dag_blocks_dags" ("transactionsId" integer NOT NULL, "dagsId" integer NOT NULL, CONSTRAINT "PK_0bcce575c236288df6a38d579c0" PRIMARY KEY ("transactionsId", "dagsId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c89538d56a0668d1c65ba491f" ON "transactions_dag_blocks_dags" ("transactionsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d77ae7e9d614b9e18cde91a9a" ON "transactions_dag_blocks_dags" ("dagsId") `
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e11180855c1afd8fe21f96a1bf8" FOREIGN KEY ("blockId") REFERENCES "pbfts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_2c89538d56a0668d1c65ba491f5" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_1d77ae7e9d614b9e18cde91a9a6" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
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
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_1d77ae7e9d614b9e18cde91a9a6"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_2c89538d56a0668d1c65ba491f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e11180855c1afd8fe21f96a1bf8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d77ae7e9d614b9e18cde91a9a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2c89538d56a0668d1c65ba491f"`
    );
    await queryRunner.query(`DROP TABLE "transactions_dag_blocks_dags"`);
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
    await queryRunner.query(`DROP TABLE "transactions"`);
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
  }
}
