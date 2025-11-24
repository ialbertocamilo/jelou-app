import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm'

@Entity('products')
@Index('idx_sku', ['sku'])
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255, unique: true })
  sku!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'int' })
  price_cents!: number

  @Column({ type: 'int', default: 0 })
  stock!: number

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date
}
