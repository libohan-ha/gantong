import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ForumCategory } from './category.entity';

export enum ForumPostPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ForumPostStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('forum_posts')
export class ForumPost {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_user_id' })
  author: User;

  @ManyToOne(() => ForumCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: ForumCategory | null;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ForumPostPriority,
    default: ForumPostPriority.NORMAL,
  })
  priority: ForumPostPriority;

  @Column({
    type: 'enum',
    enum: ForumPostStatus,
    default: ForumPostStatus.OPEN,
  })
  status: ForumPostStatus;

  @Column({ type: 'int', name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ type: 'timestamptz', name: 'last_reply_at', nullable: true })
  lastReplyAt?: Date | null;

  @Column({ name: 'has_official_reply', default: false })
  hasOfficialReply: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
