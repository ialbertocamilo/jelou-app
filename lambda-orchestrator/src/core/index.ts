import {
  ErrorResponse,
  OrchestratorResponse
} from '../types'
import {
  confirmOrder,
  createOrder,
  validateCustomer
} from '../services/api-client'
import { orchestratorRequestSchema } from '../validator'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { z } from 'zod'
import { ERRORS, HTTP_STATUS } from '../constants'

function createResponse(
  statusCode: number,
  body: OrchestratorResponse | ErrorResponse
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  }
}

export default {
  async createAndConfirmOrder(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    let correlationId: string | undefined

    try {
      if (!event.body) {
        return createResponse(HTTP_STATUS.BAD_REQUEST, {
          success: false,
          error: ERRORS.VALIDATION_ERROR,
          message: 'Missing request body'
        })
      }

      const requestData = JSON.parse(event.body)

      const validatedData = orchestratorRequestSchema.parse(requestData)
      correlationId = validatedData.correlation_id

      const customer = await validateCustomer(validatedData.customer_id)

      const order = await createOrder(customer.id, validatedData.items)

      const confirmedOrder = await confirmOrder(
        order.id,
        validatedData.idempotency_key
      )

      const response: OrchestratorResponse = {
        success: true,
        ...(correlationId && { correlationId }),
        data: {
          customer,
          order: confirmedOrder
        }
      }

      return createResponse(HTTP_STATUS.CREATED, response)
    } catch (error) {
      console.error('Error in createAndConfirmOrder:', error)

      if (error instanceof SyntaxError) {
        return createResponse(HTTP_STATUS.BAD_REQUEST, {
          success: false,
          ...(correlationId && { correlationId }),
          error: ERRORS.VALIDATION_ERROR,
          message: 'Invalid JSON in request body'
        })
      }

      if (error instanceof z.ZodError) {
        return createResponse(HTTP_STATUS.BAD_REQUEST, {
          success: false,
          ...(correlationId && { correlationId }),
          error: ERRORS.VALIDATION_ERROR,
          message: error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ')
        })
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        success: false,
        ...(correlationId && { correlationId }),
        error: ERRORS.INTERNAL_SERVER_ERROR,
        message: errorMessage
      })
    }
  }
}
