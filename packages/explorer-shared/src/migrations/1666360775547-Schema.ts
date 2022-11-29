import { MigrationInterface, QueryRunner } from 'typeorm';

export class Schema1666360775547 implements MigrationInterface {
  name = 'Schema1666360775547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `CREATE TABLE "${prefix}pbfts" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "number" integer NOT NULL, "timestamp" integer NOT NULL DEFAULT '0', "nonce" character varying, "miner" character varying, "reward" character varying, "gasLimit" character varying, "gasUsed" character varying, "parent" character varying, "difficulty" integer, "totalDifficulty" integer, "transactionCount" integer, "transactionsRoot" character varying, "extraData" character varying, "logsBloom" character varying, "mixHash" character varying, "recepitsRoot" character varying, "sha3Uncles" character varying, "size" integer, "stateRoot" character varying, CONSTRAINT "${prefix}pbfts_unique_hash" UNIQUE ("hash"), CONSTRAINT "${prefix}pbfts_pk" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_number" ON "${prefix}pbfts" ("number")`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_timestamp" ON "${prefix}pbfts" ("timestamp")`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}pbfts_index_miner" ON "${prefix}pbfts" ("miner")`
    );
    await queryRunner.query(
      `CREATE TABLE "${prefix}transactions" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "nonce" integer, "index" integer, "value" character varying, "gasPrice" character varying, "gas" character varying, "gasUsed" character varying, "cumulativeGasUsed" integer, "inputData" character varying, "status" integer, "from" character varying, "to" character varying, "v" character varying, "r" character varying, "s" character varying, "blockHash" character varying, "blockNumber" character varying, "transactionIndex" character varying, "blockId" integer, CONSTRAINT "${prefix}transactions_unique_hash" UNIQUE ("hash"), CONSTRAINT "${prefix}transactions_pk" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_from" ON "${prefix}transactions" ("from")`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}transactions_index_to" ON "${prefix}transactions" ("to")`
    );
    await queryRunner.query(
      `CREATE TABLE "${prefix}dags" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "pivot" character varying, "tips" text, "level" integer, "pbftPeriod" integer, "timestamp" integer NOT NULL DEFAULT '0', "author" character varying, "signature" character varying, "vdf" integer, "transactionCount" integer, CONSTRAINT "${prefix}dags_unique_hash" UNIQUE ("hash"), CONSTRAINT "${prefix}dags_pk" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_pbft_period" ON "${prefix}dags" ("pbftPeriod")`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_timestamp" ON "${prefix}dags" ("timestamp")`
    );
    await queryRunner.query(
      `CREATE INDEX "${prefix}dags_index_author" ON "${prefix}dags" ("author")`
    );
    await queryRunner.query(
      `CREATE TABLE "${prefix}transactions_dags" ("dagsId" integer NOT NULL, "transactionsId" integer NOT NULL, CONSTRAINT "${prefix}transactions_dags_pk" PRIMARY KEY ("dagsId", "transactionsId"))`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" ADD CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id" FOREIGN KEY ("blockId") REFERENCES "${prefix}pbfts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}transactions_dags_fk_${prefix}dags_id_dags_id" FOREIGN KEY ("dagsId") REFERENCES "${prefix}dags" ("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" ADD CONSTRAINT "${prefix}transactions_dags_fk_${prefix}transactions_id_transactions_id" FOREIGN KEY ("transactionsId") REFERENCES "${prefix}transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(`CREATE VIEW "${prefix}node_entity" AS 
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "${prefix}pbfts" GROUP BY "miner"
  `);
    await queryRunner.query(
      `INSERT INTO "${prefix}typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        `${prefix}node_entity`,
        `SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "${prefix}pbfts" GROUP BY "miner"`,
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = queryRunner.connection.options.entityPrefix ?? '';
    await queryRunner.query(
      `DELETE FROM "${prefix}typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', `${prefix}node_entity`, , 'public']
    );
    await queryRunner.query(`DROP VIEW "${prefix}node_entity"`);
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}transactions_dags_fk_${prefix}transactions_id_transactions_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions_dags" DROP CONSTRAINT "${prefix}transactions_dags_fk_${prefix}dags_id_dags_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "${prefix}transactions" DROP CONSTRAINT "${prefix}transactions_fk_block_id_${prefix}pbfts_id"`
    );
    await queryRunner.query(`DROP TABLE "${prefix}transactions_dags"`);
    await queryRunner.query(`DROP TABLE "${prefix}dags"`);
    await queryRunner.query(`DROP TABLE "${prefix}transactions"`);
    await queryRunner.query(`DROP TABLE "${prefix}pbfts"`);
  }
}
