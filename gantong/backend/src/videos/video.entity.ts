import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../users/user.entity'

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing', 
  REVIEW = 'review',
  PUBLISHED = 'published',
  REJECTED = 'rejected'
}

export enum VideoDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  authorUserId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorUserId' })
  author: User

  @Column({ length: 150 })
  title: string

  @Column('text')
  description: string

  @Column({ length: 50 })
  category: string

  @Column('simple-array', { default: '' })
  tags: string[]

  @Column('simple-array', { default: '' })
  targetAudience: string[]

  @Column({ type: 'enum', enum: VideoDifficulty, default: VideoDifficulty.BEGINNER })
  difficulty: VideoDifficulty

  @Column()
  fileName: string

  @Column('bigint')
  fileSizeBytes: number

  @Column()
  storagePath: string

  @Column({ nullable: true })
  videoUrl?: string

  @Column({ nullable: true })
  durationSeconds?: number

  @Column({ nullable: true })
  thumbnailUrl?: string

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PUBLISHED })
  status: VideoStatus

  @Column({ nullable: true })
  rejectionReason?: string

  // 作者信息快照，防止医生资料变更影响历史展示
  @Column({ default: '' })
  authorSnapshotName: string

  @Column({ default: '' })
  authorSnapshotHospital: string

  @Column({ default: '' })
  authorSnapshotTitle: string

  // 统计数据
  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  likeCount: number

  @Column({ default: 0 })
  downloadCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
