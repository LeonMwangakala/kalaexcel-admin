import api from './api'
import { WaterSupplyCustomer, WaterSupplyReading, WaterSupplyPayment } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'
import { transformAccount } from './bankingService'

const transformCustomer = (apiCustomer: any): WaterSupplyCustomer => {
  const transformed = toCamelCase(apiCustomer)
  return {
    ...transformed,
    id: transformId(transformed.id),
  }
}

const transformReading = (apiReading: any): WaterSupplyReading => {
  const transformed = toCamelCase(apiReading)
  const reading: any = {
    ...transformed,
    id: transformId(transformed.id),
    customerId: transformId(transformed.customerId),
  }
  // Preserve nested customer data if present
  if (transformed.customer) {
    reading.customer = transformCustomer(transformed.customer)
  }
  return reading
}

const transformPayment = (apiPayment: any): WaterSupplyPayment => {
  const transformed = toCamelCase(apiPayment)
  const payment: any = {
    ...transformed,
    id: transformId(transformed.id),
    readingId: transformId(transformed.readingId),
    customerId: transformId(transformed.customerId),
  }
  // Preserve nested bank account data if present
  if (transformed.bankAccount) {
    payment.bankAccount = transformAccount(transformed.bankAccount)
  }
  if (transformed.bankAccountId) {
    payment.bankAccountId = transformId(transformed.bankAccountId)
  }
  return payment
}

export const waterSupplyCustomerService = {
  async getAll(params?: { page?: number; perPage?: number }): Promise<{
    data: WaterSupplyCustomer[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }> {
    const queryParams: any = { ...params }
    const response = await api.get<any>('/water-supply-customers', { params: queryParams })
    return {
      data: response.data.data.map(transformCustomer),
      pagination: {
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        totalItems: response.data.total,
        itemsPerPage: response.data.per_page,
      },
    }
  },

  async getById(id: string): Promise<WaterSupplyCustomer> {
    const response = await api.get<any>(`/water-supply-customers/${id}`)
    return transformCustomer(response.data)
  },

  async create(data: Omit<WaterSupplyCustomer, 'id'>): Promise<WaterSupplyCustomer> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/water-supply-customers', apiData)
    return transformCustomer(response.data)
  },

  async update(id: string, data: Partial<WaterSupplyCustomer>): Promise<WaterSupplyCustomer> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/water-supply-customers/${id}`, apiData)
    return transformCustomer(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/water-supply-customers/${id}`)
  },
}

export const waterSupplyReadingService = {
  async getAll(customerId?: string, params?: { page?: number; perPage?: number }): Promise<{
    data: WaterSupplyReading[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }> {
    const queryParams: any = { ...params }
    if (customerId) queryParams.customer_id = customerId
    const response = await api.get<any>('/water-supply-readings', { params: queryParams })
    return {
      data: response.data.data.map(transformReading),
      pagination: {
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        totalItems: response.data.total,
        itemsPerPage: response.data.per_page,
      },
    }
  },

  async getById(id: string): Promise<WaterSupplyReading> {
    const response = await api.get<any>(`/water-supply-readings/${id}`)
    return transformReading(response.data)
  },

  async create(data: Omit<WaterSupplyReading, 'id'>): Promise<WaterSupplyReading> {
    const apiData = toSnakeCase(data)
    if (apiData.customer_id) apiData.customer_id = parseInt(apiData.customer_id)
    const response = await api.post<any>('/water-supply-readings', apiData)
    return transformReading(response.data)
  },

  async update(id: string, data: Partial<WaterSupplyReading>): Promise<WaterSupplyReading> {
    const apiData = toSnakeCase(data)
    if (apiData.customer_id) apiData.customer_id = parseInt(apiData.customer_id)
    const response = await api.put<any>(`/water-supply-readings/${id}`, apiData)
    return transformReading(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/water-supply-readings/${id}`)
  },
}

export const waterSupplyPaymentService = {
  async getAll(readingId?: string, customerId?: string): Promise<WaterSupplyPayment[]> {
    const params: any = {}
    if (readingId) params.reading_id = readingId
    if (customerId) params.customer_id = customerId
    const response = await api.get<any[]>('/water-supply-payments', { params })
    return response.data.map(transformPayment)
  },

  async getById(id: string): Promise<WaterSupplyPayment> {
    const response = await api.get<any>(`/water-supply-payments/${id}`)
    return transformPayment(response.data)
  },

  async create(data: Omit<WaterSupplyPayment, 'id'>): Promise<WaterSupplyPayment> {
    const apiData = toSnakeCase(data)
    if (apiData.reading_id) apiData.reading_id = parseInt(apiData.reading_id)
    if (apiData.customer_id) apiData.customer_id = parseInt(apiData.customer_id)
    const response = await api.post<any>('/water-supply-payments', apiData)
    return transformPayment(response.data)
  },

  async update(id: string, data: Partial<WaterSupplyPayment>): Promise<WaterSupplyPayment> {
    const apiData = toSnakeCase(data)
    if (apiData.reading_id) apiData.reading_id = parseInt(apiData.reading_id)
    if (apiData.customer_id) apiData.customer_id = parseInt(apiData.customer_id)
    const response = await api.put<any>(`/water-supply-payments/${id}`, apiData)
    return transformPayment(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/water-supply-payments/${id}`)
  },
}

