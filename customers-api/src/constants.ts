export const HTTP_STATUS_OK = 200
export const HTTP_STATUS_CREATED = 201
export const HTTP_STATUS_BAD_REQUEST = 400
export const HTTP_STATUS_UNAUTHORIZED = 401
export const HTTP_STATUS_FORBIDDEN = 403
export const HTTP_STATUS_NOT_FOUND = 404
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

export const ERROR_MESSAGES = {
  INVALID_CUSTOMER_ID: 'Invalid customer ID',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  MISSING_AUTH_HEADER: 'Missing or invalid authorization header',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_SERVICE_TOKEN: 'Invalid service token',
  VALIDATION_ERROR: 'Validation error',
  DUPLICATE_ENTRY: 'Duplicate entry',
  DUPLICATE_ENTRY_MESSAGE: 'A record with this value already exists',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  AT_LEAST_ONE_FIELD: 'At least one field must be provided'
} as const

export const SUCCESS_MESSAGES = {
  CUSTOMER_DELETED: 'Customer deleted successfully'
} as const
