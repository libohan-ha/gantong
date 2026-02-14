import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorAppointments1742250000000
  implements MigrationInterface
{
  name = 'CreateDoctorAppointments1742250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS doctor_appointments (
        id SERIAL PRIMARY KEY,
        parent_user_id INT NOT NULL,
        doctor_user_id INT NOT NULL,
        child_name VARCHAR(50) NOT NULL,
        child_age INT NOT NULL,
        child_gender VARCHAR(10) NOT NULL,
        parent_name VARCHAR(50) NOT NULL,
        parent_phone VARCHAR(30) NOT NULL,
        preferred_date DATE NULL,
        preferred_time VARCHAR(50) NULL,
        symptoms TEXT NULL,
        previous_treatment TEXT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS doctor_appointments`);
  }
}
