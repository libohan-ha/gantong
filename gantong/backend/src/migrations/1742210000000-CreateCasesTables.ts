import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCasesTables1742210000000 implements MigrationInterface {
    name = 'CreateCasesTables1742210000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."case_records_status_enum" AS ENUM('uploaded', 'reviewed', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "case_records" ("id" SERIAL NOT NULL, "doctorUserId" integer NOT NULL, "title" character varying(200) NOT NULL, "description" text, "status" "public"."case_records_status_enum" NOT NULL DEFAULT 'uploaded', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_case_records_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "case_files" ("id" SERIAL NOT NULL, "caseId" integer NOT NULL, "originalName" character varying(255) NOT NULL, "mimeType" character varying(120) NOT NULL, "size" bigint NOT NULL, "storagePath" character varying(1000) NOT NULL, "isEncrypted" boolean NOT NULL DEFAULT false, "checksum" character varying(128), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_case_files_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "case_records" ADD CONSTRAINT "FK_case_records_doctor" FOREIGN KEY ("doctorUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case_files" ADD CONSTRAINT "FK_case_files_case" FOREIGN KEY ("caseId") REFERENCES "case_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_files" DROP CONSTRAINT "FK_case_files_case"`);
        await queryRunner.query(`ALTER TABLE "case_records" DROP CONSTRAINT "FK_case_records_doctor"`);
        await queryRunner.query(`DROP TABLE "case_files"`);
        await queryRunner.query(`DROP TABLE "case_records"`);
        await queryRunner.query(`DROP TYPE "public"."case_records_status_enum"`);
    }
}

