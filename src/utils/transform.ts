/**
 * Utility functions for transforming data between API format (snake_case) 
 * and frontend format (camelCase)
 */

// Convert snake_case object keys to camelCase
export const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (typeof obj !== 'object') return obj

  const camelObj: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      camelObj[camelKey] = toCamelCase(obj[key])
    }
  }
  return camelObj
}

// Convert camelCase object keys to snake_case
export const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }
  if (typeof obj !== 'object') return obj

  const snakeObj: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      snakeObj[snakeKey] = toSnakeCase(obj[key])
    }
  }
  return snakeObj
}

// Helper to transform ID fields (convert number to string)
export const transformId = (id: any): string => {
  return id ? String(id) : ''
}

