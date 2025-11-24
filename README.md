# Jelou - B2B Orders Backoffice

Sistema de backoffice B2B con microservicios para gestión de clientes, productos y órdenes.

## Arquitectura

- **Customers API** (Puerto 3001): Gestión de clientes
- **Orders API** (Puerto 3002): Gestión de productos y órdenes
- **Lambda Orquestador**: Orquesta creación y confirmación de órdenes
- **MySQL 8.0**: Base de datos compartida

## Stack Técnico

- Node.js 22 + TypeScript
- Express 5
- MySQL2 con SQL parametrizado
- Zod para validación
- JWT para autenticación
- Docker + Docker Compose

## Inicio Rápido

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd jelou

cp .env.example .env
```

### 2. Levantar servicios con Docker Compose

```bash
docker-compose build
docker-compose up -d
```

### 3. Verificar servicios

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2025-11-21T...",
  "service": "customers-api"
}
```

## Variables de Entorno

### Root .env

```env
CUSTOMERS_PORT=3001
ORDERS_PORT=3002
MYSQL_PORT=3306
MYSQL_USER=jelou
MYSQL_PASSWORD=jelou_password
MYSQL_DATABASE=jelou_db
```

### customers-api/.env

```env
PORT=3000
MYSQL_HOST=database
MYSQL_PORT=3306
MYSQL_USER=jelou
MYSQL_PASSWORD=jelou_password
MYSQL_DATABASE=jelou_db
JWT_SECRET=dev-secret-key-change-in-production
SERVICE_TOKEN=service-secret-token
```

### orders-api/.env

```env
PORT=3000
MYSQL_HOST=database
MYSQL_PORT=3306
MYSQL_USER=jelou
MYSQL_PASSWORD=jelou_password
MYSQL_DATABASE=jelou_db
CUSTOMERS_API_URL=http://customers-api:3000
SERVICE_TOKEN=service-secret-token
```

## Endpoints API

### Customers API (http://localhost:3001)

#### POST /customers

Crear cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "phone": "+1-555-0100"
  }'
```

#### GET /customers/:id

Obtener cliente por ID

```bash
curl http://localhost:3001/customers/1
```

#### GET /customers?search=&cursor=&limit=

Buscar clientes

```bash
curl "http://localhost:3001/customers?search=ACME&limit=10"
```

#### PUT /customers/:id

Actualizar cliente

```bash
curl -X PUT http://localhost:3001/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corp Updated",
    "phone": "+1-555-0199"
  }'
```

#### DELETE /customers/:id

Eliminar cliente

```bash
curl -X DELETE http://localhost:3001/customers/1
```

#### GET /internal/customers/:id

Endpoint interno para servicios (requiere SERVICE_TOKEN)

```bash
curl http://localhost:3001/internal/customers/1 \
  -H "Authorization: Bearer service-secret-token"
```

### Orders API (http://localhost:3002)

#### Productos

##### POST /products

Crear producto

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-001",
    "name": "Laptop Pro 15",
    "price_cents": 129900,
    "stock": 50
  }'
```

##### GET /products/:id

Obtener producto

```bash
curl http://localhost:3002/products/1
```

##### GET /products?search=&cursor=&limit=

Buscar productos

```bash
curl "http://localhost:3002/products?search=laptop&limit=10"
```

##### PATCH /products/:id

Actualizar producto (precio/stock)

```bash
curl -X PATCH http://localhost:3002/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price_cents": 119900,
    "stock": 100
  }'
```

#### Órdenes

##### POST /orders

Crear orden (valida cliente, verifica stock, descuenta inventario)

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 2,
        "qty": 3
      }
    ]
  }'
```

Respuesta:

```json
{
  "id": 1,
  "customer_id": 1,
  "status": "CREATED",
  "total_cents": 389700,
  "created_at": "2025-11-21T...",
  "confirmed_at": null,
  "canceled_at": null,
  "items": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 2,
      "qty": 3,
      "unit_price_cents": 129900,
      "subtotal_cents": 389700
    }
  ]
}
```

##### GET /orders/:id

Obtener orden con items

```bash
curl http://localhost:3002/orders/1
```

##### GET /orders?status=&from=&to=&cursor=&limit=

Buscar órdenes

```bash
curl "http://localhost:3002/orders?status=CREATED&limit=10"
curl "http://localhost:3002/orders?from=2025-11-01&to=2025-11-30"
```

##### POST /orders/:id/confirm

Confirmar orden (IDEMPOTENTE con X-Idempotency-Key)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "X-Idempotency-Key: unique-key-123"
```

Reintentos con la misma key devuelven la misma respuesta:

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "X-Idempotency-Key: unique-key-123"
```

##### POST /orders/:id/cancel

Cancelar orden y restaurar stock

- CREATED: Cancela siempre
- CONFIRMED: Cancela solo si pasaron menos de 10 minutos

```bash
curl -X POST http://localhost:3002/orders/1/cancel
```

## Base de Datos

### Tablas

- `customers`: Clientes
- `products`: Productos con SKU, precio y stock
- `orders`: Órdenes con estados CREATED/CONFIRMED/CANCELED
- `order_items`: Items de cada orden
- `idempotency_keys`: Registro de operaciones idempotentes

### Scripts SQL

- `/db/schema.sql`: Schema completo con índices, FKs y datos de ejemplo (5 clientes, 10 productos)

### Migrar/Seed manual

```bash
docker-compose exec database mysql -u jelou -pjelou_password jelou_db

mysql> source /docker-entrypoint-initdb.d/01-schema.sql
```

## Desarrollo Local

### Sin Docker

#### Customers API

```bash
cd customers-api
cp .env.example .env
pnpm install
pnpm dev  # Puerto 3000
```

#### Orders API

```bash
cd orders-api
cp .env.example .env
pnpm install
pnpm dev  # Puerto 3000
```

### Scripts NPM

- `pnpm dev`: Modo desarrollo con hot-reload
- `pnpm build`: Build para producción
- `pnpm start`: Ejecutar build
- `pnpm test`: Ejecutar tests
- `pnpm test:watch`: Tests en modo watch

## Testing

```bash
cd customers-api
pnpm test

cd orders-api
pnpm test
```

## Flujo de Caso de Uso

### 1. Crear cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"ACME","email":"ops@acme.com","phone":"+1-555-0100"}'
```

### 2. Crear productos

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"LAPTOP-001","name":"Laptop Pro","price_cents":129900,"stock":50}'
```

### 3. Crear orden

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"qty":2}]}'
```

### 4. Confirmar orden (idempotente)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "X-Idempotency-Key: orden-1-confirm-$(date +%s)"
```

### 5. Cancelar orden (restaura stock)

```bash
curl -X POST http://localhost:3002/orders/1/cancel
```

## Logs

```bash
docker-compose logs -f customers-api
docker-compose logs -f orders-api
docker-compose logs -f database
```

## Limpieza

```bash
docker-compose down -v
```

## Próximos Pasos

- [ ] Lambda Orquestador con Serverless Framework
- [ ] Documentación OpenAPI 3.0
- [ ] Collection Postman/Insomnia
- [ ] Tests de integración completos
- [ ] CI/CD pipeline
