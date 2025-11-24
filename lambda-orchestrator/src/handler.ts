import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import orchestrator from './core'

export async function main(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return await orchestrator.createAndConfirmOrder(event)
}
