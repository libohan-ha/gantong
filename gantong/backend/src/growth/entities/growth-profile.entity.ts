import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Child } from './child.entity';

@Entity('growth_profiles')
export class GrowthProfile {
  @PrimaryColumn({ name: 'child_id' })
  childId: number;

  @OneToOne(() => Child)
  @JoinColumn({ name: 'child_id' })
  child?: Child;

  // Physical
  @Column({
    name: 'height_cm',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  heightCm: number | null;

  @Column({
    name: 'weight_kg',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  weightKg: number | null;

  @Column({ name: 'last_physical_updated', type: 'date', nullable: true })
  lastPhysicalUpdated: string | null;

  // Behavior tags
  @Column({
    name: 'behavior_strengths',
    type: 'text',
    array: true,
    default: '{}',
  })
  behaviorStrengths: string[];

  @Column({
    name: 'behavior_challenges',
    type: 'text',
    array: true,
    default: '{}',
  })
  behaviorChallenges: string[];

  @Column({
    name: 'behavior_improvements',
    type: 'text',
    array: true,
    default: '{}',
  })
  behaviorImprovements: string[];

  // Daily skills (0-100)
  @Column({ name: 'daily_self_care', type: 'smallint', nullable: true })
  dailySelfCare: number | null;

  @Column({ name: 'daily_communication', type: 'smallint', nullable: true })
  dailyCommunication: number | null;

  @Column({ name: 'daily_social', type: 'smallint', nullable: true })
  dailySocial: number | null;

  @Column({ name: 'daily_motor', type: 'smallint', nullable: true })
  dailyMotor: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
