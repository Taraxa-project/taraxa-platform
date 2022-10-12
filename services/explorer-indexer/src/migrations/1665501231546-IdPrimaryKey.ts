import { MigrationInterface, QueryRunner } from 'typeorm';

export class IdPrimaryKey1665501231546 implements MigrationInterface {
  name = 'IdPrimaryKey1665501231546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_dd1fb8cdec958490ac0761b0540"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_c774a4c5c84a4dcceb90f1ba87a"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_1ba4511a63ded8fc4597118f30f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c774a4c5c84a4dcceb90f1ba87"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ba4511a63ded8fc4597118f30"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "blockHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "PK_74b72f912b4609854864281864b"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "PK_1ba4511a63ded8fc4597118f30f" PRIMARY KEY ("dagsHash")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP COLUMN "transactionsHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "PK_1ba4511a63ded8fc4597118f30f"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP COLUMN "dagsHash"`
    );
    await queryRunner.query(`ALTER TABLE "pbfts" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "pbfts" DROP CONSTRAINT "PK_35a84f8058f83feff8f2941de6a"`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" ADD CONSTRAINT "PK_b05a2d02c2e138e3b34b26d0bab" PRIMARY KEY ("hash", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "id" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "PK_6f30cde2f4cf5a630e053758400"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "PK_dafbf038b0655b7befe420bc1f0" PRIMARY KEY ("hash", "id")`
    );
    await queryRunner.query(`ALTER TABLE "transactions" ADD "blockId" integer`);
    await queryRunner.query(`ALTER TABLE "dags" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "dags" DROP CONSTRAINT "PK_3928cee78a30b23a175d50796b2"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" ADD CONSTRAINT "PK_41107e3d2da8d1322eedb87efa9" PRIMARY KEY ("hash", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD "transactionsId" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "PK_2c89538d56a0668d1c65ba491f5" PRIMARY KEY ("transactionsId")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD "dagsId" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "PK_2c89538d56a0668d1c65ba491f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "PK_0bcce575c236288df6a38d579c0" PRIMARY KEY ("transactionsId", "dagsId")`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" DROP CONSTRAINT "PK_b05a2d02c2e138e3b34b26d0bab"`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" ADD CONSTRAINT "PK_6f76845d0ce6ec5233cc8eab5e6" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" ADD CONSTRAINT "UQ_35a84f8058f83feff8f2941de6a" UNIQUE ("hash")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "PK_dafbf038b0655b7befe420bc1f0"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "UQ_6f30cde2f4cf5a630e053758400" UNIQUE ("hash")`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" DROP CONSTRAINT "PK_41107e3d2da8d1322eedb87efa9"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" ADD CONSTRAINT "PK_e5bdea0a5a07a8377a7c0bc9432" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" ADD CONSTRAINT "UQ_3928cee78a30b23a175d50796b2" UNIQUE ("hash")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c89538d56a0668d1c65ba491f" ON "transactions_dag_blocks_dags" ("transactionsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d77ae7e9d614b9e18cde91a9a" ON "transactions_dag_blocks_dags" ("dagsId") `
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e11180855c1afd8fe21f96a1bf8" FOREIGN KEY ("blockId") REFERENCES "pbfts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_2c89538d56a0668d1c65ba491f5" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_1d77ae7e9d614b9e18cde91a9a6" FOREIGN KEY ("dagsId") REFERENCES "dags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_1d77ae7e9d614b9e18cde91a9a6"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "FK_2c89538d56a0668d1c65ba491f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e11180855c1afd8fe21f96a1bf8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d77ae7e9d614b9e18cde91a9a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2c89538d56a0668d1c65ba491f"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" DROP CONSTRAINT "UQ_3928cee78a30b23a175d50796b2"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" DROP CONSTRAINT "PK_e5bdea0a5a07a8377a7c0bc9432"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" ADD CONSTRAINT "PK_41107e3d2da8d1322eedb87efa9" PRIMARY KEY ("hash", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "UQ_6f30cde2f4cf5a630e053758400"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "PK_dafbf038b0655b7befe420bc1f0" PRIMARY KEY ("hash", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" DROP CONSTRAINT "UQ_35a84f8058f83feff8f2941de6a"`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" DROP CONSTRAINT "PK_6f76845d0ce6ec5233cc8eab5e6"`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" ADD CONSTRAINT "PK_b05a2d02c2e138e3b34b26d0bab" PRIMARY KEY ("hash", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "PK_0bcce575c236288df6a38d579c0"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "PK_2c89538d56a0668d1c65ba491f5" PRIMARY KEY ("transactionsId")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP COLUMN "dagsId"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "PK_2c89538d56a0668d1c65ba491f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP COLUMN "transactionsId"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" DROP CONSTRAINT "PK_41107e3d2da8d1322eedb87efa9"`
    );
    await queryRunner.query(
      `ALTER TABLE "dags" ADD CONSTRAINT "PK_3928cee78a30b23a175d50796b2" PRIMARY KEY ("hash")`
    );
    await queryRunner.query(`ALTER TABLE "dags" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "blockId"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "PK_dafbf038b0655b7befe420bc1f0"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "PK_6f30cde2f4cf5a630e053758400" PRIMARY KEY ("hash")`
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "pbfts" DROP CONSTRAINT "PK_b05a2d02c2e138e3b34b26d0bab"`
    );
    await queryRunner.query(
      `ALTER TABLE "pbfts" ADD CONSTRAINT "PK_35a84f8058f83feff8f2941de6a" PRIMARY KEY ("hash")`
    );
    await queryRunner.query(`ALTER TABLE "pbfts" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD "dagsHash" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "PK_1ba4511a63ded8fc4597118f30f" PRIMARY KEY ("dagsHash")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD "transactionsHash" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" DROP CONSTRAINT "PK_1ba4511a63ded8fc4597118f30f"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "PK_74b72f912b4609854864281864b" PRIMARY KEY ("transactionsHash", "dagsHash")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "blockHash" character varying`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ba4511a63ded8fc4597118f30" ON "transactions_dag_blocks_dags" ("dagsHash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c774a4c5c84a4dcceb90f1ba87" ON "transactions_dag_blocks_dags" ("transactionsHash") `
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_1ba4511a63ded8fc4597118f30f" FOREIGN KEY ("dagsHash") REFERENCES "dags"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_dag_blocks_dags" ADD CONSTRAINT "FK_c774a4c5c84a4dcceb90f1ba87a" FOREIGN KEY ("transactionsHash") REFERENCES "transactions"("hash") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_dd1fb8cdec958490ac0761b0540" FOREIGN KEY ("blockHash") REFERENCES "pbfts"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
