import api from './api'
import { PropertyType, BusinessType, TransactionCategory, ConstructionMaterial, Profile, Location, Vendor } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

const transformPropertyType = (apiType: any): PropertyType => {
  const transformed = toCamelCase(apiType)
  return {
    ...transformed,
    id: transformId(transformed.id),
    dateCreated: transformed.createdAt || transformed.dateCreated,
  }
}

const transformBusinessType = (apiType: any): BusinessType => {
  const transformed = toCamelCase(apiType)
  return {
    ...transformed,
    id: transformId(transformed.id),
    dateCreated: transformed.createdAt || transformed.dateCreated,
  }
}

const transformTransactionCategory = (apiCategory: any): TransactionCategory => {
  const transformed = toCamelCase(apiCategory)
  return {
    ...transformed,
    id: transformId(transformed.id),
    dateCreated: transformed.createdAt || transformed.dateCreated,
  }
}

const transformConstructionMaterial = (apiMaterial: any): ConstructionMaterial => {
  const transformed = toCamelCase(apiMaterial)
  return {
    ...transformed,
    id: transformId(transformed.id),
    dateCreated: transformed.createdAt || transformed.dateCreated,
  }
}

const transformProfile = (apiProfile: any): Profile => {
  const transformed = toCamelCase(apiProfile)
  return {
    ...transformed,
    id: transformId(transformed.id),
  }
}

const transformLocation = (apiLocation: any): Location => {
  const transformed = toCamelCase(apiLocation)
  return {
    ...transformed,
    id: transformId(transformed.id),
    dateCreated: transformed.createdAt || transformed.dateCreated,
  }
}

const transformVendor = (apiVendor: any): Vendor => {
  const transformed = toCamelCase(apiVendor)
  return {
    ...transformed,
    id: transformId(transformed.id),
  }
}

export const propertyTypeService = {
  async getAll(): Promise<PropertyType[]> {
    const response = await api.get<any[]>('/property-types')
    return response.data.map(transformPropertyType)
  },

  async getById(id: string): Promise<PropertyType> {
    const response = await api.get<any>(`/property-types/${id}`)
    return transformPropertyType(response.data)
  },

  async create(data: Omit<PropertyType, 'id' | 'dateCreated'>): Promise<PropertyType> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/property-types', apiData)
    return transformPropertyType(response.data)
  },

  async update(id: string, data: Partial<PropertyType>): Promise<PropertyType> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/property-types/${id}`, apiData)
    return transformPropertyType(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/property-types/${id}`)
  },
}

export const businessTypeService = {
  async getAll(): Promise<BusinessType[]> {
    const response = await api.get<any[]>('/business-types')
    return response.data.map(transformBusinessType)
  },

  async getById(id: string): Promise<BusinessType> {
    const response = await api.get<any>(`/business-types/${id}`)
    return transformBusinessType(response.data)
  },

  async create(data: Omit<BusinessType, 'id' | 'dateCreated'>): Promise<BusinessType> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/business-types', apiData)
    return transformBusinessType(response.data)
  },

  async update(id: string, data: Partial<BusinessType>): Promise<BusinessType> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/business-types/${id}`, apiData)
    return transformBusinessType(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/business-types/${id}`)
  },
}

export const transactionCategoryService = {
  async getAll(): Promise<TransactionCategory[]> {
    const response = await api.get<any[]>('/transaction-categories')
    return response.data.map(transformTransactionCategory)
  },

  async getById(id: string): Promise<TransactionCategory> {
    const response = await api.get<any>(`/transaction-categories/${id}`)
    return transformTransactionCategory(response.data)
  },

  async create(data: Omit<TransactionCategory, 'id' | 'dateCreated'>): Promise<TransactionCategory> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/transaction-categories', apiData)
    return transformTransactionCategory(response.data)
  },

  async update(id: string, data: Partial<TransactionCategory>): Promise<TransactionCategory> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/transaction-categories/${id}`, apiData)
    return transformTransactionCategory(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transaction-categories/${id}`)
  },
}

export const constructionMaterialService = {
  async getAll(): Promise<ConstructionMaterial[]> {
    const response = await api.get<any[]>('/construction-materials')
    return response.data.map(transformConstructionMaterial)
  },

  async getById(id: string): Promise<ConstructionMaterial> {
    const response = await api.get<any>(`/construction-materials/${id}`)
    return transformConstructionMaterial(response.data)
  },

  async create(data: Omit<ConstructionMaterial, 'id' | 'dateCreated'>): Promise<ConstructionMaterial> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/construction-materials', apiData)
    return transformConstructionMaterial(response.data)
  },

  async update(id: string, data: Partial<ConstructionMaterial>): Promise<ConstructionMaterial> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/construction-materials/${id}`, apiData)
    return transformConstructionMaterial(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/construction-materials/${id}`)
  },
}

export const locationService = {
  async getAll(): Promise<Location[]> {
    const response = await api.get<any[]>('/locations')
    return response.data.map(transformLocation)
  },

  async getById(id: string): Promise<Location> {
    const response = await api.get<any>(`/locations/${id}`)
    return transformLocation(response.data)
  },

  async create(data: Omit<Location, 'id' | 'dateCreated'>): Promise<Location> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/locations', apiData)
    return transformLocation(response.data)
  },

  async update(id: string, data: Partial<Location>): Promise<Location> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/locations/${id}`, apiData)
    return transformLocation(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/locations/${id}`)
  },
}

export const profileService = {
  async get(): Promise<Profile | null> {
    const response = await api.get<any>('/profile')
    return response.data ? transformProfile(response.data) : null
  },

  async create(data: Omit<Profile, 'id'>): Promise<Profile> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/profile', apiData)
    return transformProfile(response.data)
  },

  async update(data: Partial<Profile>): Promise<Profile> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>('/profile', apiData)
    return transformProfile(response.data)
  },
}

export const vendorService = {
  async getAll(): Promise<Vendor[]> {
    const response = await api.get<any[]>('/vendors')
    return response.data.map(transformVendor)
  },

  async getById(id: string): Promise<Vendor> {
    const response = await api.get<any>(`/vendors/${id}`)
    return transformVendor(response.data)
  },

  async create(data: Omit<Vendor, 'id'>): Promise<Vendor> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/vendors', apiData)
    return transformVendor(response.data)
  },

  async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/vendors/${id}`, apiData)
    return transformVendor(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/${id}`)
  },
}

