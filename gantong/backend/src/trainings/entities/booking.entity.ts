import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../users/user.entity'
import { Training } from './training.entity'

export enum BookingStatus {
  SUBMITTED = 'submitted',
  CANCELED = 'canceled',
}

@Entity('training_bookings')
export class TrainingBooking {
  @PrimaryGeneratedColumn()
  id: number

  // 家长用户
  @Column({ name: 'parent_user_id' })
  parentUserId: number
  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_user_id' })
  parent?: User

  // 医生用户
  @Column({ name: 'doctor_user_id' })
  doctorUserId: number
  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_user_id' })
  doctor?: User

  // 关联培训（单场次）
  @Column({ name: 'training_id' })
  trainingId: number
  @ManyToOne(() => Training)
  @JoinColumn({ name: 'training_id' })
  training?: Training

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.SUBMITTED })
  status: BookingStatus

  // 表单字段
  @Column({ length: 50 })
  childName: string

  @Column({ type: 'int' })
  childAge: number

  @Column({ length: 10 })
  childGender: string

  @Column({ length: 50 })
  parentName: string

  @Column({ length: 30 })
  parentPhone: string

  @Column({ type: 'date', nullable: true })
  preferredDate: string | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferredTime: string | null

  @Column({ type: 'text', nullable: true })
  symptoms: string | null

  @Column({ type: 'text', nullable: true })
  previousTreatment: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}

