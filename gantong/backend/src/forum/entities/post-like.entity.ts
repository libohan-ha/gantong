import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Column,
} from 'typeorm';

@Entity('forum_post_likes')
@Unique(['postId', 'userId'])
export class ForumPostLike {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
