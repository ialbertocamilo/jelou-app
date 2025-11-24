export const HTTP_STATUS_OK = 200
export const HTTP_STATUS_CREATED = 201
export const HTTP_STATUS_BAD_REQUEST = 400
export const HTTP_STATUS_UNAUTHORIZED = 401
export const HTTP_STATUS_FORBIDDEN = 403
export const HTTP_STATUS_NOT_FOUND = 404
export const HTTP_STATUS_CONFLICT = 409
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  CONFIRMED: 'CONFIRMED',
  CANCELED: 'CANCELED'
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ERROR_MESSAGES = {
  INVALID_PRODUCT_ID: 'Invalid product ID',
  PRODUCT_NOT_FOUND: 'Product not found',
  SKU_ALREADY_EXISTS: 'SKU already exists',
  INVALID_ORDER_ID: 'Invalid order ID',
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_CUSTOMER: 'Invalid customer',
  CUSTOMER_NOT_FOUND_MESSAGE: 'Customer not found',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  MISSING_IDEMPOTENCY_KEY: 'X-Idempotency-Key header is required',
  CANNOT_CONFIRM_ORDER: 'Cannot confirm order in current status',
  CANNOT_CANCEL_ORDER: 'Cannot cancel confirmed order after 10 minutes',
  VALIDATION_ERROR: 'Validation error',
  DUPLICATE_ENTRY: 'Duplicate entry',
  DUPLICATE_ENTRY_MESSAGE: 'A record with this value already exists',
  INTERNAL_SERVER_ERROR: 'Internal server error'
} as const
