import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Tenant } from '../../types'
import { tenantService } from '../../services/tenantService'

interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

interface TenantsState {
  tenants: Tenant[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

const initialState: TenantsState = {
  tenants: [],
  pagination: null,
  loading: false,
  error: null,
}

export const fetchTenants = createAsyncThunk(
  'tenants/fetchAll',
  async ({ page = 1, perPage = 15, search }: { page?: number; perPage?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await tenantService.getAll(page, perPage, search)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants')
    }
  }
)

export const fetchTenantById = createAsyncThunk(
  'tenants/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await tenantService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant')
    }
  }
)

export const createTenant = createAsyncThunk(
  'tenants/create',
  async (data: Omit<Tenant, 'id'>, { rejectWithValue }) => {
    try {
      return await tenantService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tenant')
    }
  }
)

export const updateTenant = createAsyncThunk(
  'tenants/update',
  async ({ id, data }: { id: string; data: Partial<Tenant> }, { rejectWithValue }) => {
    try {
      return await tenantService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant')
    }
  }
)

export const deleteTenant = createAsyncThunk(
  'tenants/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await tenantService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant')
    }
  }
)

const tenantsSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false
        state.tenants = action.payload.data
        state.pagination = {
          currentPage: Number(action.payload.currentPage) || 1,
          lastPage: Number(action.payload.lastPage) || 1,
          perPage: Number(action.payload.perPage) || 15,
          total: Number(action.payload.total) || 0,
          from: action.payload.from ? Number(action.payload.from) : null,
          to: action.payload.to ? Number(action.payload.to) : null,
        }
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.tenants.push(action.payload)
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        const index = state.tenants.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tenants[index] = action.payload
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.tenants = state.tenants.filter(t => t.id !== action.payload)
        // Update total count
        if (state.pagination) {
          state.pagination.total = Math.max(0, state.pagination.total - 1)
        }
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError } = tenantsSlice.actions
export default tenantsSlice.reducer
