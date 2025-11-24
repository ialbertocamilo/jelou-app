import { type IRouter, Request, Response, Router } from 'express'
import { asyncHandler } from '../middlewares/errorHandler'
import { authenticateService } from '../middlewares/auth'
import * as customersDb from '../db/customers'
import {
  ERROR_MESSAGES,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK
} from '../constants'

const router: IRouter = Router()

router.get(
  '/customers/:id',
  authenticateService,
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

export default router
