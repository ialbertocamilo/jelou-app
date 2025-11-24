import { AppDataSource } from './data-source'
import { Product } from './entities/Product'
import { MoreThan } from 'typeorm'
import type {
  CreateProductInput,
  UpdateProductInput
} from '../validators/products'

// Obtener el repositorio de Product
const getProductRepository = () => AppDataSource.getRepository(Product)

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const repository = getProductRepository()

  const product = repository.create({
    sku: data.sku,
    name: data.name,
    price_cents: data.price_cents,
    stock: data.stock || 0
  })

  return await repository.save(product)
}

export async function getProductById(id: number): Promise<Product | null> {
  const repository = getProductRepository()
  return await repository.findOne({ where: { id } })
}

export async function getProductsBySku(sku: string): Promise<Product | null> {
  const repository = getProductRepository()
  return await repository.findOne({ where: { sku } })
}

export async function searchProducts(
  search?: string,
  cursor?: string,
  limit: number = 20
): Promise<Product[]> {
  const repository = getProductRepository()

  if (search) {
    // Usar query builder para búsquedas complejas
    const queryBuilder = repository.createQueryBuilder('product')

    queryBuilder.where('product.id > :cursor', {
      cursor: cursor ? parseInt(cursor) : 0
    })

    queryBuilder.andWhere('(product.sku LIKE :search OR product.name LIKE :search)', {
      search: `%${search}%`
    })

    queryBuilder.orderBy('product.id', 'ASC').take(limit + 1)

    return await queryBuilder.getMany()
  }

  // Sin búsqueda, usamos find normal
  const whereConditions: any = {}

  if (cursor) {
    whereConditions.id = MoreThan(parseInt(cursor))
  }

  return await repository.find({
    where: whereConditions,
    order: { id: 'ASC' },
    take: limit + 1
  })
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product | null> {
  const repository = getProductRepository()

  const product = await repository.findOne({ where: { id } })
  if (!product) {
    return null
  }

  // Actualizar solo los campos provistos
  if (data.name !== undefined) {
    product.name = data.name
  }

  if (data.price_cents !== undefined) {
    product.price_cents = data.price_cents
  }

  if (data.stock !== undefined) {
    product.stock = data.stock
  }

  return await repository.save(product)
}

export async function decrementStock(
  productId: number,
  qty: number
): Promise<boolean> {
  const repository = getProductRepository()

  // Usar query builder para UPDATE condicional
  const result = await repository
    .createQueryBuilder()
    .update(Product)
    .set({ stock: () => 'stock - :qty' })
    .where('id = :id AND stock >= :qty', { id: productId, qty })
    .execute()

  return (result.affected ?? 0) > 0
}

export async function incrementStock(
  productId: number,
  qty: number
): Promise<void> {
  const repository = getProductRepository()

  await repository
    .createQueryBuilder()
    .update(Product)
    .set({ stock: () => 'stock + :qty' })
    .where('id = :id', { id: productId, qty })
    .execute()
}

// Re-exportar el tipo Product desde la entidad
export type { Product }
