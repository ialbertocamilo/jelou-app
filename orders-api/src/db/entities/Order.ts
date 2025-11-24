import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { OrderItem } from './OrderItem'

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED'
}

@Entity('orders')
@Index('idx_customer_id', ['customer_id'])
@Index('idx_status', ['status'])
@Index('idx_created_at', ['created_at'])
export class Order {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  customer_id!: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED
  })
  status!: OrderStatus

  @Column({ type: 'int', default: 0 })
  total_cents!: number

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at!: Date | null

  @Column({ type: 'timestamp', nullable: true })
  canceled_at!: Date | null

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true
  })
  items!: OrderItem[]
}
