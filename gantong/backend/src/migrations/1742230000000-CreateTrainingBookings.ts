import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingBookings1742230000000 implements MigrationInterface {
  name = 'CreateTrainingBookings1742230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."training_bookings_status_enum" AS ENUM('submitted','canceled')`,
    );
    await queryRunner.query(`
      CREATE TABLE "training_bookings" (
        "id" SERIAL PRIMARY KEY,
        "parent_user_id" integer NOT NULL,
        "doctor_user_id" integer NOT NULL,
        "training_id" integer NOT NULL,
        "status" "public"."training_bookings_status_enum" NOT NULL DEFAULT 'submitted',
        "childName" varchar(50) NOT NULL,
        "childAge" integer NOT NULL,
        "childGender" varchar(10) NOT NULL,
        "parentName" varchar(50) NOT NULL,
        "parentPhone" varchar(30) NOT NULL,
        "preferredDate" date,
        "preferredTime" varchar(50),
        "symptoms" text,
        "previousTreatment" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "training_bookings" ADD CONSTRAINT "FK_tb_parent" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "training_bookings" ADD CONSTRAINT "FK_tb_doctor" FOREIGN KEY ("doctor_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "training_bookings" ADD CONSTRAINT "FK_tb_training" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_tb_training_created" ON "training_bookings" ("training_id","created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_tb_training_created"`);
    await queryRunner.query(
      `ALTER TABLE "training_bookings" DROP CONSTRAINT "FK_tb_training"`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_bookings" DROP CONSTRAINT "FK_tb_doctor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_bookings" DROP CONSTRAINT "FK_tb_parent"`,
    );
    await queryRunner.query(`DROP TABLE "training_bookings"`);
    await queryRunner.query(
      `DROP TYPE "public"."training_bookings_status_enum"`,
    );
  }
}
