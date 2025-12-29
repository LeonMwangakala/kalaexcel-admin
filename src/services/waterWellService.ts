import api from './api'
import { WaterWellCollection } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'
import { transformAccount } from './bankingService'
import { transformUser } from './userService'

const transformCollection = (apiCollection: any): WaterWellCollection => {
  const transformed = toCamelCase(apiCollection)
  const collection: any = {
    ...transformed,
    id: transformId(transformed.id),
    operatorId: transformId(transformed.operatorId),
    bankAccountId: transformId(transformed.bankAccountId),
  }
  // Preserve nested operator and bank account data if present
  if (transformed.operator) {
    collection.operator = transformUser(transformed.operator)
  }
  if (transformed.bankAccount) {
    collection.bankAccount = transformAccount(transformed.bankAccount)
  }
  return collection
}

export const waterWellCollectionService = {
  async getAll(params?: { page?: number; perPage?: number }): Promise<{
    data: WaterWellCollection[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }> {
    const queryParams: any = { ...params }
    const response = await api.get<any>('/water-well-collections', { params: queryParams })
    return {
      data: response.data.data.map(transformCollection),
      pagination: {
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        totalItems: response.data.total,
        itemsPerPage: response.data.per_page,
      },
    }
  },

  async getById(id: string): Promise<WaterWellCollection> {
    const response = await api.get<any>(`/water-well-collections/${id}`)
    return transformCollection(response.data)
  },

  async create(data: Omit<WaterWellCollection, 'id'>): Promise<WaterWellCollection> {
    const apiData = toSnakeCase(data)
    if (apiData.operator_id) apiData.operator_id = parseInt(apiData.operator_id)
    if (apiData.bank_account_id) apiData.bank_account_id = parseInt(apiData.bank_account_id)
    const response = await api.post<any>('/water-well-collections', apiData)
    return transformCollection(response.data)
  },

  async update(id: string, data: Partial<WaterWellCollection>): Promise<WaterWellCollection> {
    const apiData = toSnakeCase(data)
    if (apiData.operator_id) apiData.operator_id = parseInt(apiData.operator_id)
    if (apiData.bank_account_id) apiData.bank_account_id = parseInt(apiData.bank_account_id)
    const response = await api.put<any>(`/water-well-collections/${id}`, apiData)
    return transformCollection(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/water-well-collections/${id}`)
  },
}

