import api from './api'
import { BankAccount, BankTransaction } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

export const transformAccount = (apiAccount: any): BankAccount => {
  const transformed = toCamelCase(apiAccount)
  return {
    ...transformed,
    id: transformId(transformed.id),
  }
}

const transformTransaction = (apiTransaction: any): BankTransaction & { account?: any } => {
  const transformed = toCamelCase(apiTransaction)
  return {
    ...transformed,
    id: transformId(transformed.id),
    accountId: transformId(transformed.accountId),
    // Preserve nested account object from API response
    account: transformed.account ? {
      id: transformId(transformed.account.id),
      accountName: transformed.account.accountName || transformed.account.account_name,
      bankName: transformed.account.bankName || transformed.account.bank_name,
      branchName: transformed.account.branchName || transformed.account.branch_name,
      accountNumber: transformed.account.accountNumber || transformed.account.account_number,
    } : undefined,
  }
}

export const bankAccountService = {
  async getAll(): Promise<BankAccount[]> {
    const response = await api.get<any[]>('/bank-accounts')
    return response.data.map(transformAccount)
  },

  async getById(id: string): Promise<BankAccount> {
    const response = await api.get<any>(`/bank-accounts/${id}`)
    return transformAccount(response.data)
  },

  async create(data: Omit<BankAccount, 'id'>): Promise<BankAccount> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/bank-accounts', apiData)
    return transformAccount(response.data)
  },

  async update(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/bank-accounts/${id}`, apiData)
    return transformAccount(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/bank-accounts/${id}`)
  },
}

export const bankTransactionService = {
  async getAll(accountId?: string, paginationParams?: { page?: number; perPage?: number }): Promise<{ data: BankTransaction[]; pagination?: any }> {
    const params: any = { ...paginationParams }
    if (accountId) {
      params.account_id = accountId
    }
    const response = await api.get<any>('/bank-transactions', { params })
    if (response.data.data) {
      // Paginated response
      return {
        data: response.data.data.map(transformTransaction),
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
      data: response.data.map(transformTransaction),
    }
  },

  async getById(id: string): Promise<BankTransaction> {
    const response = await api.get<any>(`/bank-transactions/${id}`)
    return transformTransaction(response.data)
  },

  async create(data: Omit<BankTransaction, 'id'>): Promise<BankTransaction> {
    const apiData = toSnakeCase(data)
    if (apiData.account_id) apiData.account_id = parseInt(apiData.account_id)
    const response = await api.post<any>('/bank-transactions', apiData)
    return transformTransaction(response.data)
  },

  async update(id: string, data: Partial<BankTransaction>): Promise<BankTransaction> {
    const apiData = toSnakeCase(data)
    if (apiData.account_id) apiData.account_id = parseInt(apiData.account_id)
    const response = await api.put<any>(`/bank-transactions/${id}`, apiData)
    return transformTransaction(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/bank-transactions/${id}`)
  },
}

