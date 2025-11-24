import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm'

@Entity('customers')
@Index('idx_email', ['email'])
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date
}
