import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

export type Gender = '男' | '女' | '未知';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_user_id' })
  parentUserId: number;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_user_id' })
  parent?: User;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 10, default: '未知' })
  gender: Gender;

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
