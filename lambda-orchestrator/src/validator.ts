import { z } from 'zod'

const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  qty: z.number().int().positive()
})

export const orchestratorRequestSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1),
  idempotency_key: z.string().min(1),
  correlation_id: z.string().optional()
})

export type OrchestratorRequestInput = z.infer<typeof orchestratorRequestSchema>
