import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RentPayment } from '../../types'
import { rentPaymentService } from '../../services/rentPaymentService'

interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

interface RentState {
  payments: RentPayment[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

const initialState: RentState = {
  payments: [],
  pagination: null,
  loading: false,
  error: null,
}

export const fetchRentPayments = createAsyncThunk(
  'rent/fetchAll',
  async ({ page = 1, perPage = 15, search }: { page?: number; perPage?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      return await rentPaymentService.getAll(page, perPage, search)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rent payments')
    }
  }
)

export const fetchRentPaymentById = createAsyncThunk(
  'rent/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await rentPaymentService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rent payment')
    }
  }
)

export const createRentPayment = createAsyncThunk(
  'rent/create',
  async (data: Omit<RentPayment, 'id'>, { rejectWithValue }) => {
    try {
      return await rentPaymentService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create rent payment')
    }
  }
)

export const updateRentPayment = createAsyncThunk(
  'rent/update',
  async ({ id, data }: { id: string; data: Partial<RentPayment> }, { rejectWithValue }) => {
    try {
      return await rentPaymentService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update rent payment')
    }
  }
)

export const deleteRentPayment = createAsyncThunk(
  'rent/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await rentPaymentService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete rent payment')
    }
  }
)

const rentSlice = createSlice({
  name: 'rent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRentPayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload.data
        state.pagination = {
          currentPage: action.payload.currentPage,
          lastPage: action.payload.lastPage,
          perPage: action.payload.perPage,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to,
        }
      })
      .addCase(fetchRentPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchRentPaymentById.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.payments[index] = action.payload
        } else {
          state.payments.push(action.payload)
        }
      })
      .addCase(createRentPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload)
      })
      .addCase(createRentPayment.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateRentPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
      })
      .addCase(updateRentPayment.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(deleteRentPayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload)
      })
      .addCase(deleteRentPayment.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError } = rentSlice.actions
export default rentSlice.reducer
