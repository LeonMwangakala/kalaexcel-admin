import api from './api'
import { User } from '../types'
import { toCamelCase, toSnakeCase, transformId } from '../utils/transform'

export const transformUser = (apiUser: any): User => {
  const transformed = toCamelCase(apiUser)
  return {
    ...transformed,
    id: transformId(transformed.id),
    dateCreated: transformed.createdAt || transformed.dateCreated,
  }
}

export const userService = {
  async getAll(params?: { page?: number; perPage?: number }): Promise<{ data: User[]; pagination?: any }> {
    const response = await api.get<any>('/users', { params })
    if (response.data.data) {
      // Paginated response
      return {
        data: response.data.data.map((u: any) => transformUser(u)),
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
      data: response.data.map((u: any) => transformUser(u)),
    }
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<any>(`/users/${id}`)
    return transformUser(response.data)
  },

  async create(data: Omit<User, 'id' | 'dateCreated' | 'lastLogin'>): Promise<User> {
    const apiData = toSnakeCase(data)
    const response = await api.post<any>('/users', apiData)
    return transformUser(response.data)
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const apiData = toSnakeCase(data)
    // Remove password from update if it's empty
    if (apiData.password === '') delete apiData.password
    const response = await api.put<any>(`/users/${id}`, apiData)
    return transformUser(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  async resetPassword(id: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`)
  },

  async toggleStatus(id: string): Promise<User> {
    const response = await api.post<any>(`/users/${id}/toggle-status`)
    return transformUser(response.data)
  },
}

