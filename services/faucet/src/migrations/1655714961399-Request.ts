import { MigrationInterface, QueryRunner } from 'typeorm';

export class Request1655714961399 implements MigrationInterface {
  name = 'Request1655714961399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(`
      CREATE TYPE ${prefix}request_status AS ENUM ('CREATED', 'DRIPPED', 'FAILED')
    `);

    await queryRunner.query(
      `CREATE TABLE "${prefix}requests" 
      (
        "id" SERIAL NOT NULL, 
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "address" character varying NOT NULL, 
        "ip" character varying NOT NULL, 
        "txHash" character varying, 
        "amount" integer NOT NULL, 
        "status" ${prefix}request_status DEFAULT 'CREATED'::${prefix}request_status,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "${prefix}requests_pk" PRIMARY KEY ("id")
      )`
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "${prefix}requests_uuid_uindex" ON "${prefix}requests" (uuid)`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}requests_address_index" ON "${prefix}requests" (address)`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}requests_ip_index" ON "${prefix}requests" (ip)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(`DROP TABLE "${prefix}requests"`);
    await queryRunner.query(`DROP TYPE "${prefix}requests"`);
  }
}
