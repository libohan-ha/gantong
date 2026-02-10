import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumCategory } from './entities/category.entity';
import { ForumPost } from './entities/post.entity';
import { ForumReply } from './entities/reply.entity';
import { ForumPostLike } from './entities/post-like.entity';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { HospitalForumController } from './hospital-forum.controller';
import { HospitalForumService } from './hospital-forum.service';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ForumCategory,
      ForumPost,
      ForumReply,
      ForumPostLike,
      User,
    ]),
  ],
  controllers: [ForumController, HospitalForumController],
  providers: [ForumService, HospitalForumService],
})
export class ForumModule {}
