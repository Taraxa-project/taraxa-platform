import { MigrationInterface, QueryRunner } from 'typeorm';

export class NodeAddressUnique1665122503495 implements MigrationInterface {
  name = 'NodeAddressUnique1665122503495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "explorer_node" ADD CONSTRAINT "UQ_829a4b7720d6e52787733c8bf4b" UNIQUE ("address")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "explorer_node" DROP CONSTRAINT "UQ_829a4b7720d6e52787733c8bf4b"`
    );
  }
}
