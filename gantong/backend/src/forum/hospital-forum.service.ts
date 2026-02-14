import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumCategory } from './entities/category.entity';
import {
  ForumPost,
  ForumPostPriority,
  ForumPostStatus,
} from './entities/post.entity';
import { ForumReply } from './entities/reply.entity';
import { ForumPostLike } from './entities/post-like.entity';
import { HospitalQueryPostsDto } from './dto/hospital-query-posts.dto';
import { Role, User } from '../users/user.entity';
import type { ForumPost as ForumPostEntity } from './entities/post.entity';

type RawPostStatsRow = {
  repliesCount?: string | number;
  likesCount?: string | number;
  last_reply_at_agg?: string | null;
};

@Injectable()
export class HospitalForumService {
  constructor(
    @InjectRepository(ForumCategory)
    private categoryRepo: Repository<ForumCategory>,
    @InjectRepository(ForumPost) private postRepo: Repository<ForumPost>,
    @InjectRepository(ForumReply) private replyRepo: Repository<ForumReply>,
    @InjectRepository(ForumPostLike)
    private postLikeRepo: Repository<ForumPostLike>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async listPosts(q: HospitalQueryPostsDto) {
    const qb = this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.author', 'a')
      .leftJoin('forum_replies', 'r', 'r.post_id = p.id')
      .leftJoin('forum_post_likes', 'l', 'l.post_id = p.id');

    // base filters
    if (q.categoryId)
      qb.andWhere('p.category_id = :cid', { cid: q.categoryId });
    if (q.q)
      qb.andWhere('(p.title ILIKE :kw OR p.content ILIKE :kw)', {
        kw: `%${q.q}%`,
      });
    if (q.priority) qb.andWhere('p.priority = :pri', { pri: q.priority });
    if (q.status) qb.andWhere('p.status = :st', { st: q.status });
    if (q.tag) qb.andWhere(':tag = ANY(p.tags)', { tag: q.tag });
    if (q.hasOfficialReply === 'true')
      qb.andWhere('p.has_official_reply = true');
    if (q.hasOfficialReply === 'false')
      qb.andWhere('p.has_official_reply = false');

    // aggregates
    qb.addSelect('COUNT(DISTINCT r.id)', 'repliesCount')
      .addSelect('COUNT(DISTINCT l.id)', 'likesCount')
      .addSelect('MAX(r.created_at)', 'last_reply_at_agg')
      .groupBy('p.id')
      .addGroupBy('c.id')
      .addGroupBy('a.id');

    // sort
    switch (q.sortBy) {
      case 'latestReply':
        qb.orderBy('last_reply_at_agg', 'DESC', 'NULLS LAST');
        break;
      case 'mostLiked':
        qb.orderBy('likesCount', 'DESC');
        break;
      case 'mostReplied':
        qb.orderBy('repliesCount', 'DESC');
        break;
      default:
        qb.orderBy('p.created_at', 'DESC');
    }

    qb.skip((q.page - 1) * q.pageSize).take(q.pageSize);

    const rowsResult: unknown = await qb.getRawAndEntities();
    const rows = rowsResult as {
      entities: ForumPostEntity[];
      raw: RawPostStatsRow[];
    };
    const items = rows.entities.map((entity, idx) => ({
      ...entity,
      stats: {
        replies: Number(rows.raw[idx]['repliesCount'] || 0),
        likes: Number(rows.raw[idx]['likesCount'] || 0),
        views: entity.viewsCount || 0,
      },
      lastReplyAt:
        rows.raw[idx]['last_reply_at_agg'] || entity.lastReplyAt || null,
    }));

    // total count (re-run count query without pagination)
    const totalQb = this.postRepo.createQueryBuilder('p');
    if (q.categoryId)
      totalQb.andWhere('p.category_id = :cid', { cid: q.categoryId });
    if (q.q)
      totalQb.andWhere('(p.title ILIKE :kw OR p.content ILIKE :kw)', {
        kw: `%${q.q}%`,
      });
    if (q.priority) totalQb.andWhere('p.priority = :pri', { pri: q.priority });
    if (q.status) totalQb.andWhere('p.status = :st', { st: q.status });
    if (q.tag) totalQb.andWhere(':tag = ANY(p.tags)', { tag: q.tag });
    if (q.hasOfficialReply === 'true')
      totalQb.andWhere('p.has_official_reply = true');
    if (q.hasOfficialReply === 'false')
      totalQb.andWhere('p.has_official_reply = false');
    const total = await totalQb.getCount();

    return { items, total, page: q.page, pageSize: q.pageSize };
  }

  async getPost(id: number) {
    const p = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'category'],
    });
    if (!p) throw new NotFoundException('帖子不存在');
    return p;
  }

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

  async createOfficialOrNormalReply(
    userId: number,
    postId: number,
    b: { content: string; parentReplyId?: number; isOfficial?: boolean },
  ) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');

    const reply = this.replyRepo.create({
      post: { id: postId } as ForumPost,
      author: { id: userId } as User,
      content: b.content,
      parent: b.parentReplyId ? ({ id: b.parentReplyId } as ForumReply) : null,
      isOfficial: b.isOfficial !== false, // 默认官方
    });
    const saved = await this.replyRepo.save(reply);

    // 更新帖子聚合信息
    await this.postRepo.update(postId, {
      lastReplyAt: () => 'now()',
      hasOfficialReply: b.isOfficial !== false ? true : post.hasOfficialReply,
      status:
        post.status === ForumPostStatus.OPEN && b.isOfficial !== false
          ? ForumPostStatus.IN_PROGRESS
          : post.status,
    });

    return saved;
  }

  async setStatus(id: number, status: ForumPostStatus) {
    const p = await this.postRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('帖子不存在');
    await this.postRepo.update(id, { status });
    return { ok: true };
  }

  async setPriority(id: number, priority: ForumPostPriority, role: Role) {
    if (priority === ForumPostPriority.URGENT && role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('只有超级管理员可以设置为紧急');
    }
    await this.postRepo.update(id, { priority });
    return { ok: true };
  }

  async deletePost(id: number) {
    await this.postRepo.delete(id);
    return { ok: true };
  }

  async deleteReply(replyId: number, userId: number, role: Role) {
    const r = await this.replyRepo.findOne({
      where: { id: replyId },
      relations: ['author', 'post'],
    });
    if (!r) throw new NotFoundException('回复不存在');
    if (role !== Role.SUPER_ADMIN && r.author?.id !== userId) {
      throw new ForbiddenException('无权删除他人回复');
    }
    await this.replyRepo.delete(replyId);
    return { ok: true };
  }

  async stats() {
    const total = await this.postRepo.count();
    const open = await this.postRepo.count({
      where: { status: ForumPostStatus.OPEN },
    });
    const inProgress = await this.postRepo.count({
      where: { status: ForumPostStatus.IN_PROGRESS },
    });
    const resolved = await this.postRepo.count({
      where: { status: ForumPostStatus.RESOLVED },
    });
    return { total, open, inProgress, resolved };
  }
}
