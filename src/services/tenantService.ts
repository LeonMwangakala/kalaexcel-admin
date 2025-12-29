import api from './api'
import { Tenant } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

const transformTenant = (apiTenant: any): Tenant & { properties?: any[] } => {
  const transformed = toCamelCase(apiTenant)
  return {
    ...transformed,
    id: transformId(transformed.id),
    propertyIds: transformed.properties 
      ? transformed.properties.map((p: any) => transformId(p.id))
      : (transformed.propertyIds || []).map((id: any) => transformId(id)),
    // Preserve nested properties array from API response
    properties: transformed.properties ? transformed.properties.map((p: any) => {
      const property = toCamelCase(p)
      return {
        id: transformId(property.id),
        name: property.name,
        size: property.size,
        status: property.status,
        monthlyRent: property.monthlyRent || property.monthly_rent,
      }
    }) : undefined,
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

export const tenantService = {
  async getAll(page: number = 1, perPage: number = 15, search?: string): Promise<PaginatedResponse<Tenant>> {
    const params: any = { page, per_page: perPage }
    if (search) {
      params.search = search
    }
    const response = await api.get<PaginatedResponse<any>>('/tenants', { params })
    return {
      ...response.data,
      data: response.data.data.map(transformTenant),
    }
  },

  async getById(id: string): Promise<Tenant> {
    const response = await api.get<any>(`/tenants/${id}`)
    return transformTenant(response.data)
  },

  async create(data: Omit<Tenant, 'id'>): Promise<Tenant> {
    const apiData: any = toSnakeCase(data)
    if (apiData.property_ids && Array.isArray(apiData.property_ids)) {
      apiData.property_ids = apiData.property_ids.map((id: string) => parseInt(id))
    }
    const response = await api.post<any>('/tenants', apiData)
    return transformTenant(response.data)
  },

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const apiData: any = toSnakeCase(data)
    if (apiData.property_ids && Array.isArray(apiData.property_ids)) {
      apiData.property_ids = apiData.property_ids.map((id: string) => parseInt(id))
    }
    const response = await api.put<any>(`/tenants/${id}`, apiData)
    return transformTenant(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`)
  },
}

