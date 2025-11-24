export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
}

export interface OrderItem {
  product_id: number
  qty: number
}

export interface OrderItemResponse {
  id: number
  order_id: number
  product_id: number
  qty: number
  unit_price_cents: number
  subtotal_cents: number
}

export interface Order {
  id: number
  customer_id: number
  status: 'CREATED' | 'CONFIRMED' | 'CANCELED'
  total_cents: number
  created_at: string
  confirmed_at: string | null
  canceled_at: string | null
  items: OrderItemResponse[]
}

export interface OrchestratorRequest {
  customer_id: number
  items: OrderItem[]
  idempotency_key: string
  correlation_id?: string
}

export interface OrchestratorResponse {
  success: boolean
  correlationId?: string
  data: {
    customer: Customer
    order: Order
  }
}

export interface ErrorResponse {
  success: false
  correlationId?: string
  error: string
  message?: string
}
