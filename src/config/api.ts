/**
 * API Configuration
 * 
 * This file manages API configuration for different environments.
 * The base URL is determined by environment variables:
 * 
 * Development: VITE_API_BASE_URL or defaults to http://localhost:8000/api
 * Production: VITE_API_BASE_URL (must be set in production)
 */

const getApiBaseUrl = (): string => {
  // Check if we have an explicit API URL from environment variables
  const envUrl = import.meta.env.VITE_API_BASE_URL

  if (envUrl) {
    return envUrl
  }

  // Default to localhost for development
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api'
  }

  // For production, if no URL is set, use current origin
  // This assumes the API is on the same domain
  if (import.meta.env.PROD) {
    const origin = window.location.origin
    return `${origin}/api`
  }

  // Fallback
  return 'http://localhost:8000/api'
}

export const apiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Log the API base URL in development (helpful for debugging)
if (import.meta.env.DEV) {
  console.log('API Base URL:', apiConfig.baseURL)
}

export default apiConfig

