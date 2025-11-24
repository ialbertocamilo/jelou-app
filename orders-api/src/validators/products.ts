import { z } from 'zod'

export const createProductSchema = z.object({
  sku: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  price_cents: z.number().int().min(0),
  stock: z.number().int().min(0).default(0)
})

export const updateProductSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    price_cents: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })

export const searchProductsSchema = z.object({
  search: z.string().optional(),
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

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type SearchProductsInput = z.infer<typeof searchProductsSchema>
