import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendForumForHospital1742240000000 implements MigrationInterface {
  name = 'ExtendForumForHospital1742240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "forum_posts" 
        ADD COLUMN "priority" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
        ADD COLUMN "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        ADD COLUMN "views_count" integer NOT NULL DEFAULT 0,
        ADD COLUMN "last_reply_at" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN "has_official_reply" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_forum_posts_status" ON "forum_posts" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_forum_posts_priority" ON "forum_posts" ("priority")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_forum_posts_last_reply" ON "forum_posts" ("last_reply_at")`,
    );

    await queryRunner.query(`
      ALTER TABLE "forum_replies" 
        ADD COLUMN "is_official" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_replies" DROP COLUMN "is_official"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_forum_posts_last_reply"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_forum_posts_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_forum_posts_status"`);
    await queryRunner.query(`
      ALTER TABLE "forum_posts" 
        DROP COLUMN "has_official_reply",
        DROP COLUMN "last_reply_at",
        DROP COLUMN "views_count",
        DROP COLUMN "status",
        DROP COLUMN "priority"
    `);
  }
}
