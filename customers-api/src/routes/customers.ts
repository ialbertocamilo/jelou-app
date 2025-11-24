import { type IRouter, Request, Response, Router } from 'express'
import { asyncHandler } from '../middlewares/errorHandler'
import {
  createCustomerSchema,
  searchCustomersSchema,
  updateCustomerSchema
} from '../validators/customers'
import * as customersDb from '../db/customers'
import {
  ERROR_MESSAGES,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
  SUCCESS_MESSAGES
} from '../constants'
import logger from '../logger'

const router: IRouter = Router()

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = createCustomerSchema.parse(req.body)

    const existing = await customersDb.getCustomerByEmail(data.email)
    if (existing) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      })
      return
    }

    const customer = await customersDb.createCustomer(data)
    logger.info({ customerId: customer.id }, 'Customer created')

    res.status(HTTP_STATUS_CREATED).json(customer)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_CUSTOMER_ID })
      return
    }

    const customer = await customersDb.getCustomerById(id)

    if (!customer) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.CUSTOMER_NOT_FOUND })
      return
    }

    res.status(HTTP_STATUS_OK).json(customer)
  })
)

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { search, cursor, limit } = searchCustomersSchema.parse(req.query)

    const customers = await customersDb.searchCustomers(search, cursor, limit)

    const hasMore = customers.length > limit
    const items = hasMore ? customers.slice(0, limit) : customers

    const nextCursor = hasMore ? items[items?.length - 1].id.toString() : null

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

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_CUSTOMER_ID })
      return
    }

    const data = updateCustomerSchema.parse(req.body)

    if (data.email) {
      const existing = await customersDb.getCustomerByEmail(data.email)
      if (existing && existing.id !== id) {
        res
          .status(HTTP_STATUS_BAD_REQUEST)
          .json({ error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS })
        return
      }
    }

    const customer = await customersDb.updateCustomer(id, data)

    if (!customer) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.CUSTOMER_NOT_FOUND })
      return
    }

    logger.info({ customerId: id }, 'Customer updated')
    res.status(HTTP_STATUS_OK).json(customer)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_CUSTOMER_ID })
      return
    }

    const deleted = await customersDb.deleteCustomer(id)

    if (!deleted) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.CUSTOMER_NOT_FOUND })
      return
    }

    logger.info({ customerId: id }, 'Customer deleted')
    res
      .status(HTTP_STATUS_OK)
      .json({ message: SUCCESS_MESSAGES.CUSTOMER_DELETED })
  })
)

export default router
