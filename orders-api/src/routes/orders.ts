import { type IRouter, Request, Response, Router } from 'express'
import { asyncHandler } from '../middlewares/errorHandler'
import { createOrderSchema, searchOrdersSchema } from '../validators/orders'
import * as ordersDb from '../db/orders'
import * as customersService from '../services/customers'
import {
  ERROR_MESSAGES,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK
} from '../constants'
import logger from '../logger'

const router: IRouter = Router()

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = createOrderSchema.parse(req.body)
    const idempotencyKey = req.headers['x-idempotency-key'] as string

    if (idempotencyKey) {
      const existing = await ordersDb.checkIdempotencyKey(idempotencyKey)

      if (existing) {
        logger.info(
          { idempotencyKey },
          'Returning cached response for idempotency key'
        )
        const cachedResponse = JSON.parse(existing.response_body)
        res.status(HTTP_STATUS_OK).json(cachedResponse)
        return
      }
    }

    const customer = await customersService.getCustomerById(data.customer_id)

    if (!customer) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_CUSTOMER,
        message: `Customer ${data.customer_id} not found`
      })
      return
    }

    const order = await ordersDb.createOrder(data)

    if (idempotencyKey) {
      await ordersDb.saveIdempotencyKey(
        idempotencyKey,
        'order_create',
        order.id,
        'completed',
        order
      )
    }

    res.status(HTTP_STATUS_CREATED).json(order)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_ORDER_ID })
      return
    }

    const order = await ordersDb.getOrderById(id)

    if (!order) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ORDER_NOT_FOUND })
      return
    }

    res.status(HTTP_STATUS_OK).json(order)
  })
)

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { status, from, to, cursor, limit } = searchOrdersSchema.parse(
      req.query
    )

    const orders = await ordersDb.searchOrders(status, from, to, cursor, limit)

    const hasMore = orders.length > limit
    const items = hasMore ? orders.slice(0, limit) : orders
    const nextCursor = hasMore ? items[items.length - 1].id.toString() : null

    res.status(HTTP_STATUS_OK).json({
      data: items,
      pagination: {
        nextCursor,
        hasMore,
        limit
      }
    })
  })
)

router.post(
  '/:id/confirm',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)
    const idempotencyKey = req.headers['x-idempotency-key'] as string

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_ORDER_ID })
      return
    }

    if (!idempotencyKey) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.MISSING_IDEMPOTENCY_KEY })
      return
    }

    const existing = await ordersDb.checkIdempotencyKey(idempotencyKey)

    if (existing) {
      logger.info(
        { idempotencyKey },
        'Returning cached response for idempotency key'
      )
      const cachedResponse = JSON.parse(existing.response_body)
      res.status(HTTP_STATUS_OK).json(cachedResponse)
      return
    }

    const order = await ordersDb.confirmOrder(id)

    if (!order) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ORDER_NOT_FOUND })
      return
    }

    await ordersDb.saveIdempotencyKey(
      idempotencyKey,
      'order_confirm',
      id,
      'completed',
      order
    )

    res.status(HTTP_STATUS_OK).json(order)
  })
)

router.post(
  '/:id/cancel',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_ORDER_ID })
      return
    }

    const order = await ordersDb.cancelOrder(id)

    if (!order) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ORDER_NOT_FOUND })
      return
    }

    res.status(HTTP_STATUS_OK).json(order)
  })
)

export default router
