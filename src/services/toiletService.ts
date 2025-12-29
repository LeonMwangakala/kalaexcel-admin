import api from './api'
import { ToiletCollection } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

const transformCollection = (apiCollection: any): ToiletCollection => {
  const transformed = toCamelCase(apiCollection)
  return {
    ...transformed,
    id: transformId(transformed.id),
    cashierId: transformed.cashierId ? transformId(transformed.cashierId) : transformed.cashierId,
    cashier: transformed.cashier ? {
      id: transformId(transformed.cashier.id),
      name: transformed.cashier.name,
      email: transformed.cashier.email,
      role: transformed.cashier.role,
    } : undefined,
    bankAccountId: transformed.bankAccountId ? transformId(transformed.bankAccountId) : transformed.bankAccountId,
    bankAccount: transformed.bankAccount ? {
      id: transformId(transformed.bankAccount.id),
      accountName: transformed.bankAccount.accountName,
      accountNumber: transformed.bankAccount.accountNumber,
      bankName: transformed.bankAccount.bankName,
    } : undefined,
  }
}

export const toiletCollectionService = {
  async getAll(params?: { page?: number; perPage?: number }): Promise<{ data: ToiletCollection[]; pagination?: any }> {
    const response = await api.get<any>('/toilet-collections', { params })
    if (response.data.data) {
      // Paginated response
      return {
        data: response.data.data.map(transformCollection),
        pagination: {
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          perPage: response.data.per_page,
          total: response.data.total,
        },
      }
    }
    // Non-paginated response (fallback)
    return {
      data: response.data.map(transformCollection),
    }
  },

  async getById(id: string): Promise<ToiletCollection> {
    const response = await api.get<any>(`/toilet-collections/${id}`)
    return transformCollection(response.data)
  },

  async create(data: Omit<ToiletCollection, 'id'>): Promise<ToiletCollection> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/toilet-collections', apiData)
    return transformCollection(response.data)
  },

  async update(id: string, data: Partial<ToiletCollection>): Promise<ToiletCollection> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/toilet-collections/${id}`, apiData)
    return transformCollection(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/toilet-collections/${id}`)
  },
}

