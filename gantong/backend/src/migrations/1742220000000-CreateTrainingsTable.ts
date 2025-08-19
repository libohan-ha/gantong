import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTrainingsTable1742220000000 implements MigrationInterface {
  name = 'CreateTrainingsTable1742220000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建培训类型枚举
    await queryRunner.query(`CREATE TYPE "public"."trainings_type_enum" AS ENUM('online', 'offline', 'hybrid')`)

    // 创建培训表
    await queryRunner.query(`
      CREATE TABLE "trainings" (
        "id" SERIAL NOT NULL,
        "doctor_user_id" integer NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text,
        "type" "public"."trainings_type_enum" NOT NULL,
        "duration_hours" integer NOT NULL,
        "max_participants" integer NOT NULL,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trainings_id" PRIMARY KEY ("id"),
        CONSTRAINT "chk_trainings_duration_hours" CHECK (duration_hours > 0),
        CONSTRAINT "chk_trainings_max_participants" CHECK (max_participants > 0)
      )
    `)

    // 创建外键约束
    await queryRunner.query(`
      ALTER TABLE "trainings"
      ADD CONSTRAINT "FK_trainings_doctor"
      FOREIGN KEY ("doctor_user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `)

    // 创建索引
    await queryRunner.query(`
      CREATE INDEX "idx_trainings_doctor_created_at"
      ON "trainings" ("doctor_user_id", "created_at")
    `)

    await queryRunner.query(`
      CREATE INDEX "idx_trainings_start_date"
      ON "trainings" ("start_date")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_trainings_start_date"`)
    await queryRunner.query(`DROP INDEX "idx_trainings_doctor_created_at"`)
    await queryRunner.query(`ALTER TABLE "trainings" DROP CONSTRAINT "FK_trainings_doctor"`)
    await queryRunner.query(`DROP TABLE "trainings"`)
    await queryRunner.query(`DROP TYPE "public"."trainings_type_enum"`)
  }
}
