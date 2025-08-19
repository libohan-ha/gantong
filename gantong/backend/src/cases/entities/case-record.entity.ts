import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/user.entity'
import { CaseFile } from './case-file.entity'

export enum CaseStatus {
  UPLOADED = 'uploaded',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('case_records')
export class CaseRecord {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  doctorUserId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorUserId' })
  doctor: User

  @Column({ length: 200 })
  title: string

  @Column('text', { nullable: true })
  description?: string | null

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.UPLOADED })
  status: CaseStatus

  @OneToMany(() => CaseFile, (f) => f.caseRecord, { cascade: true })
  files: CaseFile[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

