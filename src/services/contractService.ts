import api from './api'
import { Contract } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

const transformContract = (apiContract: any): Contract & { tenant?: any; property?: any } => {
  const transformed = toCamelCase(apiContract)
  return {
    ...transformed,
    id: transformId(transformed.id),
    tenantId: transformId(transformed.tenantId),
    propertyId: transformId(transformed.propertyId),
    // Preserve tenant and property objects from API response
    tenant: transformed.tenant ? {
      ...toCamelCase(transformed.tenant),
      id: transformId(transformed.tenant.id),
      name: transformed.tenant.name,
    } : undefined,
    property: transformed.property ? {
      ...toCamelCase(transformed.property),
      id: transformId(transformed.property.id),
      name: transformed.property.name,
    } : undefined,
  }
}

interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

export const contractService = {
  async getAll(page: number = 1, perPage: number = 15, search?: string): Promise<PaginatedResponse<Contract>> {
    const params: any = { page, per_page: perPage }
    if (search) {
      params.search = search
    }
    const response = await api.get<any>('/contracts', { params })
    return {
      data: response.data.data.map(transformContract),
      currentPage: Number(response.data.current_page) || 1,
      lastPage: Number(response.data.last_page) || 1,
      perPage: Number(response.data.per_page) || 15,
      total: Number(response.data.total) || 0,
      from: response.data.from ? Number(response.data.from) : null,
      to: response.data.to ? Number(response.data.to) : null,
    }
  },

  async getById(id: string): Promise<Contract> {
    const response = await api.get<any>(`/contracts/${id}`)
    return transformContract(response.data)
  },

  async create(data: Omit<Contract, 'id'>): Promise<Contract> {
    const apiData = toSnakeCase(data)
    if (apiData.tenant_id) apiData.tenant_id = parseInt(apiData.tenant_id)
    if (apiData.property_id) apiData.property_id = parseInt(apiData.property_id)
    const response = await api.post<any>('/contracts', apiData)
    return transformContract(response.data)
  },

  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    const apiData = toSnakeCase(data)
    if (apiData.tenant_id) apiData.tenant_id = parseInt(apiData.tenant_id)
    if (apiData.property_id) apiData.property_id = parseInt(apiData.property_id)
    const response = await api.put<any>(`/contracts/${id}`, apiData)
    return transformContract(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contracts/${id}`)
  },

  async getStats(): Promise<{ total: number; active: number; expired: number; terminated: number; totalMonthlyRent: number }> {
    const response = await api.get<any>('/contracts/stats')
    return {
      total: Number(response.data.total) || 0,
      active: Number(response.data.active) || 0,
      expired: Number(response.data.expired) || 0,
      terminated: Number(response.data.terminated) || 0,
      totalMonthlyRent: Number(response.data.totalMonthlyRent) || 0,
    }
  },
}

