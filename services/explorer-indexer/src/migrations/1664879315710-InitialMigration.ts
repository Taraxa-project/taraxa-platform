import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1664879315710 implements MigrationInterface {
  name = 'InitialMigration1664879315710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "explorer_address" ("id" SERIAL NOT NULL, "timestamp" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd2793c01b655ad755cebf74fc4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "explorer_node" ("id" character varying NOT NULL, "lastBlockNumber" integer NOT NULL, "count" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07c9c50571405beb630f56df277" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "explorer_node"`);
    await queryRunner.query(`DROP TABLE "explorer_address"`);
  }
}
