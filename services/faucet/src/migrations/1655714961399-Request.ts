import { MigrationInterface, QueryRunner } from 'typeorm';

export class Request1655714961399 implements MigrationInterface {
  name = 'Request1655714961399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "requests" 
      ("id" SERIAL NOT NULL, 
      "address" character varying NOT NULL, 
      "ip" character varying NOT NULL, 
      "txHash" character varying NOT NULL, 
      "amount" integer NOT NULL, 
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_9465df652d752ada2f7485eea2b" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "requests"`);
  }
}
