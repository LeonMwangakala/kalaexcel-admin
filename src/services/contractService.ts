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
      currentPage: Number(response.data.current_page),
      lastPage: Number(response.data.last_page),
      perPage: Number(response.data.per_page),
      total: Number(response.data.total),
      from: Number(response.data.from),
      to: Number(response.data.to),
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
}

