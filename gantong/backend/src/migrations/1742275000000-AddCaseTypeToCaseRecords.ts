import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCaseTypeToCaseRecords1742275000000
  implements MigrationInterface
{
  name = 'AddCaseTypeToCaseRecords1742275000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case_records" ADD "caseType" character varying(20) NOT NULL DEFAULT 'online'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "case_records" DROP COLUMN "caseType"`);
  }
}
