import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumPost } from './post.entity';
import { User } from '../../users/user.entity';

@Entity('forum_replies')
export class ForumReply {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => ForumPost)
  @JoinColumn({ name: 'post_id' })
  post: ForumPost;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_user_id' })
  author: User;

  @ManyToOne(() => ForumReply, { nullable: true })
  @JoinColumn({ name: 'parent_reply_id' })
  parent?: ForumReply | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false, name: 'is_official' })
  isOfficial: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
