import api from './api'
import { toCamelCase, toSnakeCase } from '../utils/transform'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  role?: 'admin' | 'manager' | 'operator' | 'cashier'
}

import { User } from '../types'

export interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  async fetchCsrfCookie(): Promise<void> {
    // Fetch CSRF cookie before making authenticated requests
    // Use Sanctum's built-in endpoint which handles CORS properly
    await api.get('/sanctum/csrf-cookie')
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Fetch CSRF cookie before login
    await this.fetchCsrfCookie()
    const response = await api.post('/login', toSnakeCase(credentials))
    // Transform response from snake_case to camelCase
    const transformedUser = toCamelCase(response.data.user)
    const user: User = {
      id: String(transformedUser.id), // Convert ID to string for consistency
      name: transformedUser.name,
      email: transformedUser.email,
      phone: transformedUser.phone || '',
      role: transformedUser.role as User['role'],
      status: transformedUser.status as User['status'],
      dateCreated: transformedUser.createdAt || transformedUser.dateCreated || new Date().toISOString(),
      lastLogin: transformedUser.lastLogin || undefined,
    }
    const authResponse: AuthResponse = {
      user,
      token: response.data.token,
    }
    // Store token and user
    localStorage.setItem('auth_token', authResponse.token)
    localStorage.setItem('user', JSON.stringify(authResponse.user))
    return authResponse
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/register', toSnakeCase(data))
    // Transform response from snake_case to camelCase
    const transformedUser = toCamelCase(response.data.user)
    const user: User = {
      id: String(transformedUser.id), // Convert ID to string for consistency
      name: transformedUser.name,
      email: transformedUser.email,
      phone: transformedUser.phone || '',
      role: transformedUser.role as User['role'],
      status: transformedUser.status as User['status'],
      dateCreated: transformedUser.createdAt || transformedUser.dateCreated || new Date().toISOString(),
      lastLogin: transformedUser.lastLogin || undefined,
    }
    const authResponse: AuthResponse = {
      user,
      token: response.data.token,
    }
    // Store token and user
    localStorage.setItem('auth_token', authResponse.token)
    localStorage.setItem('user', JSON.stringify(authResponse.user))
    return authResponse
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/user')
    const transformedUser = toCamelCase(response.data)
    return {
      id: String(transformedUser.id), // Convert ID to string for consistency
      name: transformedUser.name,
      email: transformedUser.email,
      phone: transformedUser.phone || '',
      role: transformedUser.role as User['role'],
      status: transformedUser.status as User['status'],
      dateCreated: transformedUser.createdAt || transformedUser.dateCreated || new Date().toISOString(),
      lastLogin: transformedUser.lastLogin || undefined,
    }
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  async updatePassword(data: { currentPassword: string; password: string; passwordConfirmation: string }): Promise<void> {
    await api.put('/user/password', toSnakeCase({
      current_password: data.currentPassword,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
    }))
  },
}

