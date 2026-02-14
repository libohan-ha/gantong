import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'completed'
  | 'cancelled';

@Entity('doctor_appointments')
export class DoctorAppointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_user_id', type: 'int' })
  parentUserId: number;

  @Column({ name: 'doctor_user_id', type: 'int' })
  doctorUserId: number;

  // 表单字段
  @Column({ name: 'child_name', length: 50 })
  childName: string;

  @Column({ name: 'child_age', type: 'int' })
  childAge: number;

  @Column({ name: 'child_gender', length: 10 })
  childGender: string;

  @Column({ name: 'parent_name', length: 50 })
  parentName: string;

  @Column({ name: 'parent_phone', length: 30 })
  parentPhone: string;

  @Column({ name: 'preferred_date', type: 'date', nullable: true })
  preferredDate: string | null;

  @Column({
    name: 'preferred_time',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  preferredTime: string | null;

  @Column({ type: 'text', nullable: true })
  symptoms: string | null;

  @Column({ name: 'previous_treatment', type: 'text', nullable: true })
  previousTreatment: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
