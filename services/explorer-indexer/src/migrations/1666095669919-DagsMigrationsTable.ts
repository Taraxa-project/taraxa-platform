import { MigrationInterface, QueryRunner } from 'typeorm';

export class DagsMigrationsTable1666095669919 implements MigrationInterface {
  name = 'DagsMigrationsTable1666095669919';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_be4644191d84fd783e820de1836" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_92f89e03ca315be39f64d8ea642" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_92f89e03ca315be39f64d8ea642"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_be4644191d84fd783e820de1836"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92f89e03ca315be39f64d8ea64"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be4644191d84fd783e820de183"`
    );
    await queryRunner.query(`DROP TABLE "transactions_dags"`);
  }
}
