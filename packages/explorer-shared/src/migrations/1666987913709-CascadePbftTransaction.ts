import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadePbftTransaction1666987913709 implements MigrationInterface {
  name = 'CascadePbftTransaction1666987913709';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
