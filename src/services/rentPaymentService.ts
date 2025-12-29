import api from './api'
import { RentPayment } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

const transformRentPayment = (apiPayment: any): RentPayment & { contract?: any; tenant?: any; property?: any } => {
  const transformed = toCamelCase(apiPayment)
  return {
    ...transformed,
    id: transformId(transformed.id),
    tenantId: transformId(transformed.tenantId),
    contractId: transformed.contractId ? transformId(transformed.contractId) : undefined,
    bankAccountId: transformed.bankAccountId ? transformId(transformed.bankAccountId) : undefined,
    status: transformed.status || 'pending', // Ensure status is explicitly included from backend
    amount: transformed.amount || 0,
    month: transformed.month || '',
    paymentDate: transformed.paymentDate || transformed.payment_date || '',
    paymentMethod: transformed.paymentMethod || transformed.payment_method || 'cash',
    bankReceipt: transformed.bankReceipt || transformed.bank_receipt || undefined,
    // Preserve nested objects from API response
    contract: transformed.contract ? {
      ...toCamelCase(transformed.contract),
      id: transformId(transformed.contract.id),
      contractNumber: transformed.contract.contract_number || transformed.contract.contractNumber || transformed.contract.contractNumber,
      property: transformed.contract.property ? {
        ...toCamelCase(transformed.contract.property),
        id: transformId(transformed.contract.property.id),
        name: transformed.contract.property.name,
      } : undefined,
    } : undefined,
    tenant: transformed.tenant ? {
      ...toCamelCase(transformed.tenant),
      id: transformId(transformed.tenant.id),
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

export const rentPaymentService = {
  async getAll(page: number = 1, perPage: number = 15, search?: string): Promise<PaginatedResponse<RentPayment>> {
    const params: any = { page, per_page: perPage }
    if (search) {
      params.search = search
    }
    const response = await api.get<any>('/rent-payments', { params })
    return {
      data: response.data.data.map(transformRentPayment),
      currentPage: Number(response.data.current_page),
      lastPage: Number(response.data.last_page),
      perPage: Number(response.data.per_page),
      total: Number(response.data.total),
      from: Number(response.data.from),
      to: Number(response.data.to),
    }
  },

  async getById(id: string): Promise<RentPayment> {
    const response = await api.get<any>(`/rent-payments/${id}`)
    return transformRentPayment(response.data)
  },

  async create(data: Omit<RentPayment, 'id'>): Promise<RentPayment> {
    const apiData = toSnakeCase(data)
    if (apiData.contract_id) apiData.contract_id = parseInt(apiData.contract_id)
    if (apiData.bank_account_id) apiData.bank_account_id = parseInt(apiData.bank_account_id)
    const response = await api.post<any>('/rent-payments', apiData)
    return transformRentPayment(response.data)
  },

  async update(id: string, data: Partial<RentPayment>): Promise<RentPayment> {
    const apiData = toSnakeCase(data)
    if (apiData.contract_id) apiData.contract_id = parseInt(apiData.contract_id)
    if (apiData.bank_account_id) apiData.bank_account_id = parseInt(apiData.bank_account_id)
    const response = await api.put<any>(`/rent-payments/${id}`, apiData)
    return transformRentPayment(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rent-payments/${id}`)
  },
}

