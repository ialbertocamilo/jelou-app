import 'reflect-metadata'
import express from 'express'
import helmet from 'helmet'
import { HTTP_STATUS_OK } from './constants'
import config from './config'
import logger from './logger'
import productsRouter from './routes/products'
import ordersRouter from './routes/orders'
import { errorHandler } from './middlewares/errorHandler'
import { initializeDatabase } from './db/data-source'

const app = express()

app.use(helmet())
app.use(express.json())

app.get('/health', (req, res) => {
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: config.name
  }
  res.status(HTTP_STATUS_OK).json(response)
})

app.get('/', (req, res) => {
  res.status(HTTP_STATUS_OK).json({
    service: 'Orders API',
    version: '1.0.0'
  })
})

app.use('/products', productsRouter)
app.use('/orders', ordersRouter)

app.use(errorHandler)

async function bootstrap() {
  try {
    await initializeDatabase()
    app.listen(config.port, () => {
      logger.info(`${config.name} running on port ${config.port}`)
    })
  } catch (error) {
    logger.error({ error }, 'Failed to start server')
    process.exit(1)
  }
}

bootstrap()
