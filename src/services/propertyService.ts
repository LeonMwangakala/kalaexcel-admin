import api from './api'
import { Property } from '../types'
import { toCamelCase, transformId } from '../utils/transform'

// Transform API response (snake_case) to frontend format (camelCase)
const transformProperty = (apiProperty: any): Property & { tenants?: any[]; propertyType?: any; location?: any } => {
  const transformed = toCamelCase(apiProperty)
  return {
    id: transformId(transformed.id),
    name: transformed.name,
    propertyTypeId: transformed.propertyTypeId 
      ? transformId(transformed.propertyTypeId) 
      : (transformed.propertyType?.id ? transformId(transformed.propertyType.id) : undefined),
    locationId: transformed.locationId 
      ? transformId(transformed.locationId) 
      : (transformed.location?.id ? transformId(transformed.location.id) : undefined),
    size: transformed.size,
    status: transformed.status,
    monthlyRent: parseFloat(transformed.monthlyRent || transformed.monthly_rent || 0),
    dateAdded: transformed.dateAdded || transformed.date_added || transformed.createdAt || transformed.created_at,
    // Preserve nested objects from API response
    tenants: transformed.tenants ? transformed.tenants.map((t: any) => {
      const tenant = toCamelCase(t)
      return {
        id: transformId(tenant.id),
        name: tenant.name,
        phone: tenant.phone,
        idNumber: tenant.idNumber || tenant.id_number,
        businessType: tenant.businessType || tenant.business_type,
        status: tenant.status,
      }
    }) : undefined,
    propertyType: transformed.propertyType ? {
      id: transformId(transformed.propertyType.id),
      name: transformed.propertyType.name,
    } : undefined,
    location: transformed.location ? {
      id: transformId(transformed.location.id),
      name: transformed.location.name,
    } : undefined,
  }
}

// Transform frontend format (camelCase) to API format (snake_case)
const transformToApiFormat = (property: Partial<Property>): any => {
  const apiData: any = {}
  if (property.name !== undefined) apiData.name = property.name
  if (property.propertyTypeId !== undefined) apiData.property_type_id = property.propertyTypeId ? parseInt(property.propertyTypeId) : null
  if (property.locationId !== undefined) apiData.location_id = property.locationId ? parseInt(property.locationId) : null
  if (property.size !== undefined) apiData.size = property.size
  if (property.status !== undefined) apiData.status = property.status
  if (property.monthlyRent !== undefined) apiData.monthly_rent = property.monthlyRent
  if (property.dateAdded !== undefined) apiData.date_added = property.dateAdded
  return apiData
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

export const propertyService = {
  async getAll(page: number = 1, perPage: number = 15, search?: string): Promise<PaginatedResponse<Property>> {
    const params: any = { page, per_page: perPage }
    if (search) {
      params.search = search
    }
    const response = await api.get<any>('/properties', { params })
    return {
      data: response.data.data.map(transformProperty),
      currentPage: Number(response.data.current_page) || 1,
      lastPage: Number(response.data.last_page) || 1,
      perPage: Number(response.data.per_page) || 15,
      total: Number(response.data.total) || 0,
      from: response.data.from ? Number(response.data.from) : null,
      to: response.data.to ? Number(response.data.to) : null,
    }
  },

  async getById(id: string): Promise<Property> {
    const response = await api.get<any>(`/properties/${id}`)
    return transformProperty(response.data)
  },

  async create(data: Omit<Property, 'id'>): Promise<Property> {
    const apiData = transformToApiFormat(data)
    const response = await api.post<any>('/properties', apiData)
    return transformProperty(response.data)
  },

  async update(id: string, data: Partial<Property>): Promise<Property> {
    const apiData = transformToApiFormat(data)
    const response = await api.put<any>(`/properties/${id}`, apiData)
    return transformProperty(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/properties/${id}`)
  },

  async getAvailable(): Promise<Property[]> {
    const response = await api.get<any[]>('/properties/available/list')
    return response.data.map(transformProperty)
  },
}

