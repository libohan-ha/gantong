import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateForumTables1742232000000 implements MigrationInterface {
  name = 'CreateForumTables1742232000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "forum_categories" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(50) UNIQUE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_posts" (
        "id" SERIAL PRIMARY KEY,
        "author_user_id" integer NOT NULL,
        "category_id" integer NOT NULL,
        "title" varchar(200) NOT NULL,
        "content" text NOT NULL,
        "tags" text[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_author" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_category" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_forum_posts_cat_created" ON "forum_posts" ("category_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_replies" (
        "id" SERIAL PRIMARY KEY,
        "post_id" integer NOT NULL,
        "author_user_id" integer NOT NULL,
        "parent_reply_id" integer,
        "content" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "forum_replies" ADD CONSTRAINT "FK_forum_replies_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "forum_replies" ADD CONSTRAINT "FK_forum_replies_author" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "forum_replies" ADD CONSTRAINT "FK_forum_replies_parent" FOREIGN KEY ("parent_reply_id") REFERENCES "forum_replies"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_forum_replies_post_created" ON "forum_replies" ("post_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_post_likes" (
        "id" SERIAL PRIMARY KEY,
        "post_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_forum_post_like" UNIQUE ("post_id", "user_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "forum_post_likes" ADD CONSTRAINT "FK_forum_post_like_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "forum_post_likes" ADD CONSTRAINT "FK_forum_post_like_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_post_likes" DROP CONSTRAINT "FK_forum_post_like_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_likes" DROP CONSTRAINT "FK_forum_post_like_post"`,
    );
    await queryRunner.query(`DROP TABLE "forum_post_likes"`);

    await queryRunner.query(`DROP INDEX "idx_forum_replies_post_created"`);
    await queryRunner.query(
      `ALTER TABLE "forum_replies" DROP CONSTRAINT "FK_forum_replies_parent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_replies" DROP CONSTRAINT "FK_forum_replies_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_replies" DROP CONSTRAINT "FK_forum_replies_post"`,
    );
    await queryRunner.query(`DROP TABLE "forum_replies"`);

    await queryRunner.query(`DROP INDEX "idx_forum_posts_cat_created"`);
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_author"`,
    );
    await queryRunner.query(`DROP TABLE "forum_posts"`);

    await queryRunner.query(`DROP TABLE "forum_categories"`);
  }
}
