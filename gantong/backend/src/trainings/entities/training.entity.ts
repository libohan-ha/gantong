import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../users/user.entity'

export enum TrainingType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid'
}

@Entity('trainings')
export class Training {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'doctor_user_id' })
  doctorUserId: number

  @Column({ length: 200 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ 
    type: 'enum', 
    enum: TrainingType,
    name: 'type'
  })
  type: TrainingType

  @Column({ name: 'duration_hours' })
  durationHours: number

  @Column({ name: 'max_participants' })
  maxParticipants: number

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // 关联创建者（医生）
  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_user_id' })
  doctor?: User
}
