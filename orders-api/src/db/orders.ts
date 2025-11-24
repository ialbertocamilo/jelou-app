import {AppDataSource} from './data-source'
import {Order, OrderStatus as OrderStatusEnum} from './entities/Order'
import {OrderItem} from './entities/OrderItem'
import {IdempotencyKey} from './entities/IdempotencyKey'
import * as productsDb from './products'
import type {CreateOrderInput} from '../validators/orders'
import {ORDER_STATUS, type OrderStatus} from '../constants'
import logger from '../logger'

export type OrderWithItems = Order

export interface IdempotencyRecord {
  key: string
  target_type: string
  target_id: number
  status: string
  response_body: string
}

const getOrderRepository = () => AppDataSource.getRepository(Order)
const getIdempotencyKeyRepository = () =>
  AppDataSource.getRepository(IdempotencyKey)

export async function checkIdempotencyKey(
  key: string
): Promise<IdempotencyRecord | null> {
  const repository = getIdempotencyKeyRepository()
  logger.info(`Checking idempotency key: ${key} `)
  const record = await repository
    .createQueryBuilder('idem')
    .where('idem.key = :key', { key })
    .andWhere('idem.expires_at > NOW()')
    .getOne()

  if (!record) return null

  return {
    key: record.key,
    target_type: record.target_type,
    target_id: record.target_id,
    status: record.status,
    response_body: record.response_body || ''
  }
}

export async function saveIdempotencyKey(
  key: string,
  targetType: string,
  targetId: number,
  status: string,
  responseBody: any
): Promise<void> {
  const repository = getIdempotencyKeyRepository()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const idempotencyKey = repository.create({
    key,
    target_type: targetType,
    target_id: targetId,
    status,
    response_body: JSON.stringify(responseBody),
    expires_at: expiresAt
  })

  await repository.save(idempotencyKey)
}

export async function createOrder(
  data: CreateOrderInput
): Promise<OrderWithItems> {
  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    let totalCents = 0
    const itemsToCreate: Array<{
      productId: number
      qty: number
      unitPrice: number
      subtotal: number
    }> = []

    for (const item of data.items) {
      const product = await productsDb.getProductById(item.product_id)

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`)
      }

      if (product.stock < item.qty) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.qty}`
        )
      }

      const success = await productsDb.decrementStock(item.product_id, item.qty)
      if (!success) {
        throw new Error(`Failed to decrement stock for product ${product.name}`)
      }

      const subtotal = product.price_cents * item.qty
      totalCents += subtotal

      itemsToCreate.push({
        productId: item.product_id,
        qty: item.qty,
        unitPrice: product.price_cents,
        subtotal
      })
    }

    const order = queryRunner.manager.create(Order, {
      customer_id: data.customer_id,
      status: OrderStatusEnum.CREATED,
      total_cents: totalCents
    })

    const savedOrder = await queryRunner.manager.save(Order, order)

    const orderItems: OrderItem[] = []
    for (const itemData of itemsToCreate) {
      const orderItem = queryRunner.manager.create(OrderItem, {
        order_id: savedOrder.id,
        product_id: itemData.productId,
        qty: itemData.qty,
        unit_price_cents: itemData.unitPrice,
        subtotal_cents: itemData.subtotal
      })
      orderItems.push(orderItem)
    }

    await queryRunner.manager.save(OrderItem, orderItems)

    await queryRunner.commitTransaction()

    const finalOrder = await getOrderById(savedOrder.id)
    if (!finalOrder) {
      throw new Error('Order created but could not be retrieved')
    }

    logger.info({ orderId: savedOrder.id }, 'Order created successfully')
    return finalOrder
  } catch (error) {
    await queryRunner.rollbackTransaction()
    logger.error({ error }, 'Failed to create order')
    throw error
  } finally {
    await queryRunner.release()
  }
}

export async function getOrderById(id: number): Promise<OrderWithItems | null> {
  const repository = getOrderRepository()

  const order = await repository.findOne({
    where: { id },
    relations: ['items']
  })

  return order
}

export async function searchOrders(
  status?: OrderStatus,
  from?: string,
  to?: string,
  cursor?: string,
  limit: number = 20
): Promise<Order[]> {
  const repository = getOrderRepository()
  const queryBuilder = repository.createQueryBuilder('order')

  if (cursor) {
    queryBuilder.andWhere('order.id > :cursor', { cursor: parseInt(cursor) })
  }

  if (status) {
    queryBuilder.andWhere('order.status = :status', { status })
  }

  if (from) {
    queryBuilder.andWhere('order.created_at >= :from', { from })
  }

  if (to) {
    queryBuilder.andWhere('order.created_at <= :to', { to })
  }

  queryBuilder.orderBy('order.id', 'ASC').take(limit + 1)

  return await queryBuilder.getMany()
}

export async function confirmOrder(
  orderId: number
): Promise<OrderWithItems | null> {
  const repository = getOrderRepository()
  const order = await getOrderById(orderId)

  if (!order) {
    return null
  }

  if (order.status === ORDER_STATUS.CONFIRMED) {
    return order
  }

  if (order.status !== ORDER_STATUS.CREATED) {
    throw new Error(`Cannot confirm order in status ${order.status}`)
  }

  order.status = OrderStatusEnum.CONFIRMED
  order.confirmed_at = new Date()

  await repository.save(order)

  logger.info({ orderId }, 'Order confirmed')
  return getOrderById(orderId)
}

export async function cancelOrder(
  orderId: number
): Promise<OrderWithItems | null> {
  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const order = await getOrderById(orderId)

    if (!order) {
      await queryRunner.rollbackTransaction()
      return null
    }

    if (order.status === ORDER_STATUS.CANCELED) {
      await queryRunner.rollbackTransaction()
      return order
    }

    if (order.status === ORDER_STATUS.CONFIRMED) {
      const confirmedAt = new Date(order.confirmed_at!)
      const now = new Date()
      const diffMinutes = (now.getTime() - confirmedAt.getTime()) / 1000 / 60

      if (diffMinutes > 10) {
        await queryRunner.rollbackTransaction()
        throw new Error('Cannot cancel confirmed order after 10 minutes')
      }
    }

    for (const item of order.items) {
      await productsDb.incrementStock(item.product_id, item.qty)
    }

    order.status = OrderStatusEnum.CANCELED
    order.canceled_at = new Date()

    await queryRunner.manager.save(Order, order)

    await queryRunner.commitTransaction()

    logger.info({ orderId }, 'Order canceled and stock restored')
    return getOrderById(orderId)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    logger.error({ error, orderId }, 'Failed to cancel order')
    throw error
  } finally {
    await queryRunner.release()
  }
}

export type { Order, OrderItem }
