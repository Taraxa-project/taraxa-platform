import { MigrationInterface, QueryRunner } from 'typeorm';

export class DagMigrationsCascade1666194051227 implements MigrationInterface {
  name = 'DagMigrationsCascade1666194051227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_be4644191d84fd783e820de1836"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_92f89e03ca315be39f64d8ea642"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_92f89e03ca315be39f64d8ea642" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_be4644191d84fd783e820de1836" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE NO ACTION ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_be4644191d84fd783e820de1836"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" DROP CONSTRAINT "FK_92f89e03ca315be39f64d8ea642"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_92f89e03ca315be39f64d8ea642" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dags" ADD CONSTRAINT "FK_be4644191d84fd783e820de1836" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
