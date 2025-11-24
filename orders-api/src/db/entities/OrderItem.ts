import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { Order } from './Order'
import { Product } from './Product'

@Entity('order_items')
@Index('idx_order_id', ['order_id'])
@Index('idx_product_id', ['product_id'])
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  order_id!: number

  @Column({ type: 'int' })
  product_id!: number

  @Column({ type: 'int' })
  qty!: number

  @Column({ type: 'int' })
  unit_price_cents!: number

  @Column({ type: 'int' })
  subtotal_cents!: number

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product
}
