const environment = process.env
const config = {
  port: environment.PORT || 3000,
  mode: environment.APP_ENV || 'development',
  name: environment.APP_NAME || 'customers-api'
}

export type Config = typeof config
export default config
