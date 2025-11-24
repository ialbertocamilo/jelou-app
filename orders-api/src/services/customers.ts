import axios from 'axios'
import config from '../config'
import logger from '../logger'

export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
}

export async function validateCustomer(
  customerId: number
): Promise<Customer | null> {
  try {
    const response = await axios.get(
      `${config.customersApiUrl}/internal/customers/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${config.serviceToken}`
        },
        timeout: 5000
      }
    )

    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null
    }

    logger.error(
      { error: error.message, customerId },
      'Failed to validate customer'
    )
    throw new Error('Failed to validate customer with Customers API')
  }
}
