import { Router, Request, Response, type IRouter } from 'express'
import { asyncHandler } from '../middlewares/errorHandler'
import {
  createProductSchema,
  updateProductSchema,
  searchProductsSchema
} from '../validators/products'
import * as productsDb from '../db/products'
import {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  ERROR_MESSAGES
} from '../constants'
import logger from '../logger'

const router: IRouter = Router()

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = createProductSchema.parse(req.body)

    const existing = await productsDb.getProductsBySku(data.sku)
    if (existing) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        error: ERROR_MESSAGES.SKU_ALREADY_EXISTS
      })
      return
    }

    const product = await productsDb.createProduct(data)
    logger.info({ productId: product.id }, 'Product created')

    res.status(HTTP_STATUS_CREATED).json(product)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_PRODUCT_ID })
      return
    }

    const product = await productsDb.getProductById(id)

    if (!product) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND })
      return
    }

    res.status(HTTP_STATUS_OK).json(product)
  })
)

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { search, cursor, limit } = searchProductsSchema.parse(req.query)

    const products = await productsDb.searchProducts(search, cursor, limit)

    const hasMore = products.length > limit
    const items = hasMore ? products.slice(0, limit) : products
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

router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_PRODUCT_ID })
      return
    }

    const data = updateProductSchema.parse(req.body)

    const product = await productsDb.updateProduct(id, data)

    if (!product) {
      res
        .status(HTTP_STATUS_NOT_FOUND)
        .json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND })
      return
    }

    logger.info({ productId: id }, 'Product updated')
    res.status(HTTP_STATUS_OK).json(product)
  })
)

export default router
