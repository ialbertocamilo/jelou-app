import { AppDataSource } from './data-source'
import { Customer } from './entities/Customer'
import { Like, MoreThan } from 'typeorm'
import type {
  CreateCustomerInput,
  UpdateCustomerInput
} from '../validators/customers'

// Obtener el repositorio de Customer
const getCustomerRepository = () => AppDataSource.getRepository(Customer)

export async function createCustomer(
  data: CreateCustomerInput
): Promise<Customer> {
  const repository = getCustomerRepository()

  const customer = repository.create({
    name: data.name,
    email: data.email,
    phone: data.phone || null
  })

  return await repository.save(customer)
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const repository = getCustomerRepository()
  return await repository.findOne({ where: { id } })
}

export async function getCustomerByEmail(
  email: string
): Promise<Customer | null> {
  const repository = getCustomerRepository()
  return await repository.findOne({ where: { email } })
}

export async function searchCustomers(
  search?: string,
  cursor?: string,
  limit: number = 20
): Promise<Customer[]> {
  const repository = getCustomerRepository()

  const whereConditions: any = {}

  if (cursor) {
    whereConditions.id = MoreThan(parseInt(cursor))
  }

  if (search) {
    // TypeORM no soporta búsqueda OR múltiple de forma simple
    // Usamos query builder para mayor flexibilidad
    const queryBuilder = repository.createQueryBuilder('customer')

    queryBuilder.where('customer.id > :cursor', {
      cursor: cursor ? parseInt(cursor) : 0
    })

    if (search) {
      queryBuilder.andWhere(
        '(customer.name LIKE :search OR customer.email LIKE :search OR customer.phone LIKE :search)',
        { search: `%${search}%` }
      )
    }

    queryBuilder.orderBy('customer.id', 'ASC').take(limit + 1)

    return await queryBuilder.getMany()
  }

  // Sin búsqueda, usamos find normal
  return await repository.find({
    where: whereConditions,
    order: { id: 'ASC' },
    take: limit + 1
  })
}

export async function updateCustomer(
  id: number,
  data: UpdateCustomerInput
): Promise<Customer | null> {
  const repository = getCustomerRepository()

  const customer = await repository.findOne({ where: { id } })
  if (!customer) {
    return null
  }

  // Actualizar solo los campos provistos
  if (data.name !== undefined) {
    customer.name = data.name
  }

  if (data.email !== undefined) {
    customer.email = data.email
  }

  if (data.phone !== undefined) {
    customer.phone = data.phone
  }

  return await repository.save(customer)
}

export async function deleteCustomer(id: number): Promise<boolean> {
  const repository = getCustomerRepository()
  const result = await repository.delete(id)
  return (result.affected ?? 0) > 0
}

// Re-exportar la interfaz Customer desde la entidad
export type { Customer }
