import { z } from 'zod'

export const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  qty: z.number().int().positive()
})

export const createOrderSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1)
})

export const searchOrdersSchema = z.object({
  status: z.enum(['CREATED', 'CONFIRMED', 'CANCELED']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.preprocess(
    (val) => {
      if (val === undefined) return 20
      const parsed = parseInt(String(val), 10)
      return isNaN(parsed) ? 20 : parsed
    },
    z.number().int().positive().max(100).default(20)
  )
})

export type OrderItemInput = z.infer<typeof orderItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type SearchOrdersInput = z.infer<typeof searchOrdersSchema>
