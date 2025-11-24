import { AppDataSource } from '../db/data-source'
import { Customer } from '../db/entities/Customer'

export type { Customer }

const getCustomerRepository = () => AppDataSource.getRepository(Customer)

export async function getCustomerById(
  customerId: number
): Promise<Customer | null> {
  const repository = getCustomerRepository()

  return await repository.findOne({
    where: { id: customerId }
  })
}
