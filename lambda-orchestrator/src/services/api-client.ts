import axios, { AxiosInstance } from 'axios'
import type { Customer, Order, OrderItem } from '../types'

const CUSTOMERS_API_BASE =
  process.env.CUSTOMERS_API_BASE || 'http://localhost:3001'
const ORDERS_API_BASE = process.env.ORDERS_API_BASE || 'http://localhost:3002'
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'service-secret-token'

const customersClient: AxiosInstance = axios.create({
  baseURL: CUSTOMERS_API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SERVICE_TOKEN}`
  }
})

const ordersClient: AxiosInstance = axios.create({
  baseURL: ORDERS_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function validateCustomer(customerId: number): Promise<Customer> {
  try {
    const response = await customersClient.get<Customer>(
      `/internal/customers/${customerId}`
    )
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Customer ${customerId} not found`)
    }
    throw new Error(`Failed to validate customer: ${error.message}`)
  }
}

export async function createOrder(
  customerId: number,
  items: OrderItem[]
): Promise<Order> {
  try {
    const response = await ordersClient.post<Order>('/orders', {
      customer_id: customerId,
      items
    })
    return response.data
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    throw new Error(`Failed to create order: ${errorMessage}`)
  }
}

export async function confirmOrder(
  orderId: number,
  idempotencyKey: string
): Promise<Order> {
  try {
    const response = await ordersClient.post<Order>(
      `/orders/${orderId}/confirm`,
      {},
      {
        headers: {
          'X-Idempotency-Key': idempotencyKey
        }
      }
    )
    return response.data
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    throw new Error(`Failed to confirm order: ${errorMessage}`)
  }
}
