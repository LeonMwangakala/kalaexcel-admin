import api from './api'
import { ConstructionProject, ConstructionExpense } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

const transformProject = (apiProject: any): ConstructionProject => {
  const transformed = toCamelCase(apiProject)
  return {
    ...transformed,
    id: transformId(transformed.id),
  }
}

const transformExpense = (apiExpense: any): ConstructionExpense & { vendor?: any; bankAccount?: any } => {
  const transformed = toCamelCase(apiExpense)
  const result: ConstructionExpense & { vendor?: any; bankAccount?: any } = {
    ...transformed,
    id: transformId(transformed.id),
    projectId: transformId(transformed.projectId),
    materialId: transformed.materialId ? transformId(transformed.materialId) : undefined,
    quantity: transformed.quantity ? parseFloat(transformed.quantity) : undefined,
    unitPrice: transformed.unitPrice ? parseFloat(transformed.unitPrice) : undefined,
    vendorId: transformId(transformed.vendorId),
    bankAccountId: transformId(transformed.bankAccountId),
  }
  // Preserve nested vendor and bankAccount data if present
  if (transformed.vendor) {
    result.vendor = transformed.vendor
  }
  if (transformed.bankAccount) {
    result.bankAccount = transformed.bankAccount
  }
  return result
}

export const constructionProjectService = {
  async getAll(params?: { page?: number; perPage?: number }): Promise<{ data: ConstructionProject[]; pagination?: any }> {
    const response = await api.get<any>('/construction-projects', { params })
    if (response.data.data) {
      // Paginated response
      return {
        data: response.data.data.map(transformProject),
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
      data: response.data.map(transformProject),
    }
  },

  async getById(id: string): Promise<ConstructionProject> {
    const response = await api.get<any>(`/construction-projects/${id}`)
    return transformProject(response.data)
  },

  async create(data: Omit<ConstructionProject, 'id'>): Promise<ConstructionProject> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/construction-projects', apiData)
    return transformProject(response.data)
  },

  async update(id: string, data: Partial<ConstructionProject>): Promise<ConstructionProject> {
    const apiData = toSnakeCase(data)
    const response = await api.put<any>(`/construction-projects/${id}`, apiData)
    return transformProject(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/construction-projects/${id}`)
  },
}

export const constructionExpenseService = {
  async getAll(projectId?: string, paginationParams?: { page?: number; perPage?: number }): Promise<{ data: ConstructionExpense[]; pagination?: any }> {
    const params: any = { ...paginationParams }
    if (projectId) {
      params.project_id = projectId
    }
    const response = await api.get<any>('/construction-expenses', { params })
    if (response.data.data) {
      // Paginated response
      return {
        data: response.data.data.map(transformExpense),
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
      data: response.data.map(transformExpense),
    }
  },

  async getById(id: string): Promise<ConstructionExpense> {
    const response = await api.get<any>(`/construction-expenses/${id}`)
    return transformExpense(response.data)
  },

  async create(data: Omit<ConstructionExpense, 'id'>): Promise<ConstructionExpense> {
    const apiData = toSnakeCase(data)
    if (apiData.project_id) apiData.project_id = parseInt(apiData.project_id)
    const response = await api.post<any>('/construction-expenses', apiData)
    return transformExpense(response.data)
  },

  async update(id: string, data: Partial<ConstructionExpense>): Promise<ConstructionExpense> {
    const apiData = toSnakeCase(data)
    if (apiData.project_id) apiData.project_id = parseInt(apiData.project_id)
    const response = await api.put<any>(`/construction-expenses/${id}`, apiData)
    return transformExpense(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/construction-expenses/${id}`)
  },
}

