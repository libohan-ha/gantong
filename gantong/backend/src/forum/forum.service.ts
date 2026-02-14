import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumCategory } from './entities/category.entity';
import { ForumPost } from './entities/post.entity';
import { ForumReply } from './entities/reply.entity';
import { ForumPostLike } from './entities/post-like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(ForumCategory)
    private readonly categoryRepo: Repository<ForumCategory>,
    @InjectRepository(ForumPost)
    private readonly postRepo: Repository<ForumPost>,
    @InjectRepository(ForumReply)
    private readonly replyRepo: Repository<ForumReply>,
    @InjectRepository(ForumPostLike)
    private readonly postLikeRepo: Repository<ForumPostLike>,
  ) {}

  // categories
  async listCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  // posts
  async createPost(userId: number, dto: CreatePostDto) {
    let category: ForumCategory | null = null;
    if (dto.categoryId !== undefined) {
      category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('分类不存在');
    }

    const post = this.postRepo.create({
      title: dto.title,
      content: dto.content,
      tags: dto.tags ?? [],
      author: { id: userId } as User,
      category: category ? ({ id: category.id } as ForumCategory) : null,
    });
    return this.postRepo.save(post);
  }

  async listPosts(q: QueryPostsDto) {
    const qb = this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.author', 'a')
      .orderBy('p.createdAt', 'DESC')
      .skip((q.page - 1) * q.pageSize)
      .take(q.pageSize);

    if (q.categoryId) qb.andWhere('c.id = :cid', { cid: q.categoryId });
    if (q.q)
      qb.andWhere('(p.title ILIKE :kw OR p.content ILIKE :kw)', {
        kw: `%${q.q}%`,
      });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page: q.page, pageSize: q.pageSize };
  }

  async getPost(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'category'],
    });
    if (!post) throw new NotFoundException('帖子不存在');
    return post;
  }

  // replies
  async listReplies(postId: number, page = 1, pageSize = 20) {
    const [items, total] = await this.replyRepo.findAndCount({
      where: { post: { id: postId } as ForumPost },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['author'],
    });
    return { items, total, page, pageSize };
  }

  async createReply(userId: number, postId: number, dto: CreateReplyDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');

    const reply = this.replyRepo.create({
      post: { id: postId } as ForumPost,
      author: { id: userId } as User,
      content: dto.content,
      parent: dto.parentReplyId
        ? ({ id: dto.parentReplyId } as ForumReply)
        : null,
    });
    const saved = await this.replyRepo.save(reply);

    // Update last reply timestamp for the post
    await this.postRepo.update(postId, { lastReplyAt: () => 'now()' });

    return saved;
  }

  // likes
  async togglePostLike(postId: number, userId: number) {
    const exist = await this.postLikeRepo.findOne({
      where: { postId, userId },
    });
    if (exist) {
      await this.postLikeRepo.remove(exist);
      return { liked: false };
    }
    await this.postLikeRepo.save(this.postLikeRepo.create({ postId, userId }));
    return { liked: true };
  }
}
