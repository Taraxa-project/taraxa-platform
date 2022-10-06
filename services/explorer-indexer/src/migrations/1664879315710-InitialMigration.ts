import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1664879315710 implements MigrationInterface {
  name = 'InitialMigration1664879315710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dags" ("hash" character varying NOT NULL, 
      "timestamp" integer NOT NULL default 0, 
      "pivot" character varying, 
      "level" integer,
      "pbftPeriod" integer,  
      "author" character varying,
      "signature" character varying,
      "vdf" integer,
      "transactionCount" integer,
      CONSTRAINT "PK_aaaaa3c01b655ad755cebf74fc5" PRIMARY KEY ("hash"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pbfts" ("hash" character varying NOT NULL, 
      "timestamp" integer NOT NULL default 0, 
      "number" integer NOT NULL,
      "nonce" character varying,
      "miner" character varying,
      "gasLimit" bigint,  
      "gasUsed" bigint,  
      "parent" character varying,
      "difficulty" integer,
      "totalDifficulty" integer,
      "transactionCount" integer,
      CONSTRAINT "PK_cccccc93c01b655ad755cebf74fc6" PRIMARY KEY ("hash"))`
    );
    await queryRunner.query(
      `CREATE TABLE "explorer_node" ("id" character varying NOT NULL, 
      "lastBlockNumber" integer NOT NULL, 
      "count" integer NOT NULL, 
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_0dcdsc50571405beb630f56df277" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "explorer_node"`);
    await queryRunner.query(`DROP TABLE "explorer_address"`);
  }
}
