import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { WaterSupplyCustomer, WaterSupplyReading, WaterSupplyPayment } from '../../types'
import { 
  waterSupplyCustomerService, 
  waterSupplyReadingService, 
  waterSupplyPaymentService 
} from '../../services/waterSupplyService'

interface WaterSupplyState {
  customers: WaterSupplyCustomer[]
  readings: WaterSupplyReading[]
  payments: WaterSupplyPayment[]
  loading: boolean
  error: string | null
  customersPagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  } | null
  readingsPagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  } | null
}

const initialState: WaterSupplyState = {
  customers: [],
  readings: [],
  payments: [],
  loading: false,
  error: null,
  customersPagination: null,
  readingsPagination: null,
}

// Customer thunks
export const fetchCustomers = createAsyncThunk(
  'waterSupply/fetchCustomers',
  async ({ page, perPage }: { page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      return await waterSupplyCustomerService.getAll({ page, perPage })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers')
    }
  }
)

export const fetchCustomerById = createAsyncThunk(
  'waterSupply/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await waterSupplyCustomerService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'waterSupply/createCustomer',
  async (data: Omit<WaterSupplyCustomer, 'id'>, { rejectWithValue }) => {
    try {
      return await waterSupplyCustomerService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer')
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'waterSupply/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<WaterSupplyCustomer> }, { rejectWithValue }) => {
    try {
      return await waterSupplyCustomerService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer')
    }
  }
)

export const deleteCustomer = createAsyncThunk(
  'waterSupply/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await waterSupplyCustomerService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer')
    }
  }
)

// Reading thunks
export const fetchReadings = createAsyncThunk(
  'waterSupply/fetchReadings',
  async ({ customerId, page, perPage }: { customerId?: string; page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      return await waterSupplyReadingService.getAll(customerId, { page, perPage })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch readings')
    }
  }
)

export const fetchReadingById = createAsyncThunk(
  'waterSupply/fetchReadingById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await waterSupplyReadingService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reading')
    }
  }
)

export const createReading = createAsyncThunk(
  'waterSupply/createReading',
  async (data: Omit<WaterSupplyReading, 'id'>, { rejectWithValue }) => {
    try {
      return await waterSupplyReadingService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reading')
    }
  }
)

export const updateReading = createAsyncThunk(
  'waterSupply/updateReading',
  async ({ id, data }: { id: string; data: Partial<WaterSupplyReading> }, { rejectWithValue }) => {
    try {
      return await waterSupplyReadingService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reading')
    }
  }
)

export const deleteReading = createAsyncThunk(
  'waterSupply/deleteReading',
  async (id: string, { rejectWithValue }) => {
    try {
      await waterSupplyReadingService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reading')
    }
  }
)

// Payment thunks
export const fetchPayments = createAsyncThunk(
  'waterSupply/fetchPayments',
  async ({ readingId, customerId }: { readingId?: string; customerId?: string } = {}, { rejectWithValue }) => {
    try {
      return await waterSupplyPaymentService.getAll(readingId, customerId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments')
    }
  }
)

export const fetchPaymentById = createAsyncThunk(
  'waterSupply/fetchPaymentById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await waterSupplyPaymentService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment')
    }
  }
)

export const createPayment = createAsyncThunk(
  'waterSupply/createPayment',
  async (data: Omit<WaterSupplyPayment, 'id'>, { rejectWithValue }) => {
    try {
      return await waterSupplyPaymentService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment')
    }
  }
)

export const updatePayment = createAsyncThunk(
  'waterSupply/updatePayment',
  async ({ id, data }: { id: string; data: Partial<WaterSupplyPayment> }, { rejectWithValue }) => {
    try {
      return await waterSupplyPaymentService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment')
    }
  }
)

export const deletePayment = createAsyncThunk(
  'waterSupply/deletePayment',
  async (id: string, { rejectWithValue }) => {
    try {
      await waterSupplyPaymentService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment')
    }
  }
)

const waterSupplySlice = createSlice({
  name: 'waterSupply',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.data
        state.customersPagination = action.payload.pagination
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload)
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload)
      })
      // Readings
      .addCase(fetchReadings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReadings.fulfilled, (state, action) => {
        state.loading = false
        state.readings = action.payload.data
        state.readingsPagination = action.payload.pagination
      })
      .addCase(fetchReadings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createReading.fulfilled, (state, action) => {
        state.readings.push(action.payload)
      })
      .addCase(updateReading.fulfilled, (state, action) => {
        const index = state.readings.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.readings[index] = action.payload
        }
      })
      .addCase(deleteReading.fulfilled, (state, action) => {
        state.readings = state.readings.filter(r => r.id !== action.payload)
      })
      // Payments
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload)
        // Update reading payment status
        const reading = state.readings.find(r => r.id === action.payload.readingId)
        if (reading) {
          reading.paymentStatus = 'paid'
          reading.paymentDate = action.payload.paymentDate
        }
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload)
      })
  },
})

export const { clearError } = waterSupplySlice.actions
export default waterSupplySlice.reducer
