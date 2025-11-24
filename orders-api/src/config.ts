const environment = process.env
const config = {
  port: environment.PORT || 3000,
  mode: environment.APP_ENV || 'development',
  name: environment.APP_NAME || 'orders-api',
  customersApiUrl: environment.CUSTOMERS_API_URL || 'http://customers-api:3000',
  serviceToken: environment.SERVICE_TOKEN || 'service-secret-token'
}

export type Config = typeof config
export default config
