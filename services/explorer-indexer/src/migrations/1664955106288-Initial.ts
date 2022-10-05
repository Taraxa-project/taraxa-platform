import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1664955106288 implements MigrationInterface {
  name = 'Initial1664955106288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "explorer_node" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "lastBlockNumber" integer NOT NULL DEFAULT '0', "pbftCount" integer NOT NULL DEFAULT '0', "dagCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_07c9c50571405beb630f56df277" UNIQUE ("id"), CONSTRAINT "PK_07c9c50571405beb630f56df277" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pbfts" ("hash" character varying NOT NULL, "number" integer NOT NULL, "timestamp" integer NOT NULL, "nonce" character varying, "miner" character varying, "gasLimit" integer, "gasUsed" integer, "parent" character varying, "difficulty" integer, "totalDifficulty" integer, "transactionCount" integer, "transactions" text, CONSTRAINT "PK_35a84f8058f83feff8f2941de6a" PRIMARY KEY ("hash"))`
    );
    await queryRunner.query(
      `CREATE TABLE "dags" ("hash" character varying NOT NULL, "pivot" character varying, "tips" text, "level" integer, "pbftPeriod" integer, "timestamp" integer NOT NULL, "author" character varying, "signature" character varying, "vdf" integer, "transactionCount" integer, "transactions" text, CONSTRAINT "PK_3928cee78a30b23a175d50796b2" PRIMARY KEY ("hash"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dags"`);
    await queryRunner.query(`DROP TABLE "pbfts"`);
    await queryRunner.query(`DROP TABLE "explorer_node"`);
  }
}
