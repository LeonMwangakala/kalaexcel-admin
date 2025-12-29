import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Contract } from '../../types'
import { contractService } from '../../services/contractService'

interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

interface ContractsState {
  contracts: Contract[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

const initialState: ContractsState = {
  contracts: [],
  pagination: null,
  loading: false,
  error: null,
}

export const fetchContracts = createAsyncThunk(
  'contracts/fetchAll',
  async ({ page = 1, perPage = 15, search }: { page?: number; perPage?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      return await contractService.getAll(page, perPage, search)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contracts')
    }
  }
)

export const fetchContractById = createAsyncThunk(
  'contracts/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await contractService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contract')
    }
  }
)

export const createContract = createAsyncThunk(
  'contracts/create',
  async (data: Omit<Contract, 'id'>, { rejectWithValue }) => {
    try {
      return await contractService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create contract')
    }
  }
)

export const updateContract = createAsyncThunk(
  'contracts/update',
  async ({ id, data }: { id: string; data: Partial<Contract> }, { rejectWithValue }) => {
    try {
      return await contractService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contract')
    }
  }
)

export const deleteContract = createAsyncThunk(
  'contracts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await contractService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete contract')
    }
  }
)

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = action.payload.data
        state.pagination = {
          currentPage: action.payload.currentPage,
          lastPage: action.payload.lastPage,
          perPage: action.payload.perPage,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to,
        }
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.contracts.push(action.payload)
      })
      .addCase(createContract.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        const index = state.contracts.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.contracts[index] = action.payload
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.contracts = state.contracts.filter(c => c.id !== action.payload)
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(fetchContractById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
        state.loading = false
        // Add or update the contract in the contracts array
        const index = state.contracts.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.contracts[index] = action.payload
        } else {
          state.contracts.push(action.payload)
        }
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = contractsSlice.actions
export default contractsSlice.reducer
