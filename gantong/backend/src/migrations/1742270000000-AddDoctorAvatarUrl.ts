import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorAvatarUrl1742270000000 implements MigrationInterface {
  name = 'AddDoctorAvatarUrl1742270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE doctor_profiles
      ADD COLUMN IF NOT EXISTS "avatarUrl" VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE doctor_profiles
      DROP COLUMN IF EXISTS "avatarUrl"
    `);
  }
}
