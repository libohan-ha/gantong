import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm'
import { User } from './user.entity'

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryColumn() 
  userId: number

  @OneToOne(() => User, (u) => u.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) 
  user: User

  @Column({ default: '' })
  name: string

  @Column({ default: '' })
  hospital: string

  @Column({ nullable: true }) 
  title?: string

  @Column({ nullable: true, type: 'int' }) 
  age?: number

  @Column({ nullable: true }) 
  phone?: string

  @Column({ default: false }) 
  verified: boolean
}
