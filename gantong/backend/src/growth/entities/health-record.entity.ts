import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Child } from './child.entity'

@Entity('health_records')
export class HealthRecord {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'child_id' })
  childId: number
  @ManyToOne(() => Child)
  @JoinColumn({ name: 'child_id' })
  child?: Child

  @Column({ type: 'date' })
  date: string

  @Column({ type: 'varchar', length: 50 })
  type: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ type: 'text', nullable: true })
  result: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

