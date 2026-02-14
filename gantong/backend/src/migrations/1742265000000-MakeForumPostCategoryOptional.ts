import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeForumPostCategoryOptional1742265000000
  implements MigrationInterface
{
  name = 'MakeForumPostCategoryOptional1742265000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ALTER COLUMN "category_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_category" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_category"`,
    );
    await queryRunner.query(
      `DELETE FROM "forum_posts" WHERE "category_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ALTER COLUMN "category_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_category" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT`,
    );
  }
}
