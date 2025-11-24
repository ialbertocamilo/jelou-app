import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm'

@Entity('idempotency_keys')
@Index('idx_expires_at', ['expires_at'])
@Index('idx_target', ['target_type', 'target_id'])
export class IdempotencyKey {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key!: string

  @Column({ type: 'varchar', length: 50 })
  target_type!: string

  @Column({ type: 'int' })
  target_id!: number

  @Column({ type: 'varchar', length: 50 })
  status!: string

  @Column({ type: 'text', nullable: true })
  response_body!: string | null

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date

  @Column({ type: 'timestamp' })
  expires_at!: Date
}
