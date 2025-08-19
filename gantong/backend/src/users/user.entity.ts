import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm'
import { DoctorProfile } from './doctor-profile.entity'

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DOCTOR = 'DOCTOR',
  PARENT = 'PARENT',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment') 
  id: number

  @Column({ unique: true, nullable: true }) 
  email?: string

  @Column({ unique: true, nullable: true })
  phone?: string

  @Column({ select: false, nullable: true }) 
  passwordHash?: string

  @Column({ type: 'enum', enum: Role, default: Role.PARENT })
  role: Role

  @Column({ default: true })
  enabled: boolean

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date

  @OneToOne(() => DoctorProfile, (p) => p.user, { cascade: true })
  doctorProfile?: DoctorProfile

  @OneToMany('Video', 'author')
  videos?: any[]
}
