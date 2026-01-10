import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Property } from '../../types'
import { propertyService } from '../../services/propertyService'

interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

interface PropertiesState {
  properties: Property[]
  pagination: PaginationMeta | null
  stats: { total: number; occupied: number; available: number } | null
  loading: boolean
  error: string | null
}

const initialState: PropertiesState = {
  properties: [],
  pagination: null,
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async ({ page = 1, perPage = 15, search }: { page?: number; perPage?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await propertyService.getAll(page, perPage, search)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch properties'
      )
    }
  }
)

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const property = await propertyService.getById(id)
      return property
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch property'
      )
    }
  }
)

export const createProperty = createAsyncThunk(
  'properties/create',
  async (data: Omit<Property, 'id'>, { rejectWithValue }) => {
    try {
      const property = await propertyService.create(data)
      return property
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create property'
      )
    }
  }
)

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, data }: { id: string; data: Partial<Property> }, { rejectWithValue }) => {
    try {
      const property = await propertyService.update(id, data)
      return property
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update property'
      )
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete property'
      )
    }
  }
)

export const fetchPropertyStats = createAsyncThunk(
  'properties/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await propertyService.getStats()
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch property statistics'
      )
    }
  }
)

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload.data
        state.pagination = {
          currentPage: Number(action.payload.currentPage) || 1,
          lastPage: Number(action.payload.lastPage) || 1,
          perPage: Number(action.payload.perPage) || 15,
          total: Number(action.payload.total) || 0,
          from: action.payload.from ? Number(action.payload.from) : null,
          to: action.payload.to ? Number(action.payload.to) : null,
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create
      .addCase(createProperty.fulfilled, (state, action) => {
        // Refresh the list to get updated pagination
        // In a real app, you might want to add to the current page or refresh
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Update
      .addCase(updateProperty.fulfilled, (state, action) => {
        const index = state.properties.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.properties[index] = action.payload
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Delete
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.properties = state.properties.filter(p => p.id !== action.payload)
        // Update total count in pagination
        if (state.pagination) {
          state.pagination.total = Math.max(0, state.pagination.total - 1)
          // Recalculate last page
          if (state.pagination.total > 0 && state.pagination.perPage > 0) {
            state.pagination.lastPage = Math.ceil(state.pagination.total / state.pagination.perPage)
            // Adjust current page if it's beyond the last page
            if (state.pagination.currentPage > state.pagination.lastPage) {
              state.pagination.currentPage = Math.max(1, state.pagination.lastPage)
            }
          } else {
            state.pagination.lastPage = 1
            state.pagination.currentPage = 1
          }
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Stats
      .addCase(fetchPropertyStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      .addCase(fetchPropertyStats.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError } = propertiesSlice.actions
export default propertiesSlice.reducer