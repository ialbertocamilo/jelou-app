import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional()
})

export const updateCustomerSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(50).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })

export const searchCustomersSchema = z.object({
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

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type SearchCustomersInput = z.infer<typeof searchCustomersSchema>
