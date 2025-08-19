import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateGrowthModule1742231000000 implements MigrationInterface {
  name = 'CreateGrowthModule1742231000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "children" (
        "id" SERIAL PRIMARY KEY,
        "parent_user_id" integer NOT NULL,
        "name" varchar(50) NOT NULL,
        "gender" varchar(10) NOT NULL DEFAULT '未知',
        "birthDate" date NOT NULL,
        "avatar_url" varchar(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "children" ADD CONSTRAINT "FK_children_parent" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      CREATE TABLE "growth_profiles" (
        "child_id" integer PRIMARY KEY,
        "height_cm" numeric(5,2),
        "weight_kg" numeric(5,2),
        "last_physical_updated" date,
        "behavior_strengths" text[] NOT NULL DEFAULT '{}',
        "behavior_challenges" text[] NOT NULL DEFAULT '{}',
        "behavior_improvements" text[] NOT NULL DEFAULT '{}',
        "daily_self_care" smallint,
        "daily_communication" smallint,
        "daily_social" smallint,
        "daily_motor" smallint,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "growth_profiles" ADD CONSTRAINT "FK_growth_child" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      CREATE TABLE "health_records" (
        "id" SERIAL PRIMARY KEY,
        "child_id" integer NOT NULL,
        "date" date NOT NULL,
        "type" varchar(50) NOT NULL,
        "description" text,
        "result" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "health_records" ADD CONSTRAINT "FK_health_child" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`CREATE INDEX "idx_health_child_date" ON "health_records" ("child_id","date" DESC)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_health_child_date"`)
    await queryRunner.query(`ALTER TABLE "health_records" DROP CONSTRAINT "FK_health_child"`)
    await queryRunner.query(`DROP TABLE "health_records"`)
    await queryRunner.query(`ALTER TABLE "growth_profiles" DROP CONSTRAINT "FK_growth_child"`)
    await queryRunner.query(`DROP TABLE "growth_profiles"`)
    await queryRunner.query(`ALTER TABLE "children" DROP CONSTRAINT "FK_children_parent"`)
    await queryRunner.query(`DROP TABLE "children"`)
  }
}

