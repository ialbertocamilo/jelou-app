import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Product } from './entities/Product'
import { Order } from './entities/Order'
import { OrderItem } from './entities/OrderItem'
import { IdempotencyKey } from './entities/IdempotencyKey'
import { Customer } from './entities/Customer'
import logger from '../logger'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'database',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  username: process.env.MYSQL_USER || 'jelou',
  password: process.env.MYSQL_PASSWORD || 'jelou_password',
  database: process.env.MYSQL_DATABASE || 'jelou_db',
  entities: [Product, Order, OrderItem, IdempotencyKey, Customer],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  poolSize: 10,
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
})

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize()
    logger.info('TypeORM DataSource initialized successfully')
  } catch (error) {
    logger.error({ error }, 'Error initializing TypeORM DataSource')
    throw error
  }
}
