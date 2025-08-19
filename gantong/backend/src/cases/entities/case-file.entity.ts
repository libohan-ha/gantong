import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { CaseRecord } from './case-record.entity'

@Entity('case_files')
export class CaseFile {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  caseId: number

  @ManyToOne(() => CaseRecord, (c) => c.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  caseRecord: CaseRecord

  @Column({ length: 255 })
  originalName: string

  @Column({ length: 120 })
  mimeType: string

  @Column('bigint')
  size: number

  @Column({ length: 1000 })
  storagePath: string

  @Column({ default: false })
  isEncrypted: boolean

  @Column({ type: 'varchar', nullable: true, length: 128 })
  checksum?: string | null

  @CreateDateColumn()
  createdAt: Date
}

