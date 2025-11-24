# Instalación


## Levantar el proyecto

```bash
pnpm install

cp .env.example .env

docker-compose up -d

docker compose up -d
```



- **Customers API**: http://localhost:3001
- **Orders API**: http://localhost:3002
- **Lambda Orchestrator**: http://localhost:3003

## Documentación OpenAPI

El proyecto incluye especificación OpenAPI 3.0 en `openapi.yaml` con todos los endpoints documentados.


**Importar en Postman:**
1. Abrir Postman
2. Import > openapi.yaml
3. Todos los endpoints listos para probar

## Variables de entorno

```env
CUSTOMERS_PORT=3001
ORDERS_PORT=3002

MYSQL_PORT=3306
MYSQL_USER=jelou
MYSQL_PASSWORD=jelou_password
MYSQL_DATABASE=jelou_db

CUSTOMERS_API_BASE=http://localhost:3001
ORDERS_API_BASE=http://localhost:3002
SERVICE_TOKEN=secret-token
```


## Lambda Orchestrator

### AWS

```bash
cd lambda-orchestrator

npm install -g serverless
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET

serverless deploy --stage dev

serverless deploy --stage prod
serverless invoke -f createAndConfirmOrder --stage dev --data '{
  "body": "{\"customer_id\": 1, \"items\": [{\"product_id\": 1, \"qty\": 2}]}"
}'

curl -X POST https://abc123.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}]
  }'

serverless logs -f createAndConfirmOrder --stage dev --tail

# ver info del stack
serverless info --stage dev

# eliminar stack
serverless remove --stage dev
```


## Health checks

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```
