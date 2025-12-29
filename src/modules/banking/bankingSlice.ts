import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BankAccount, BankTransaction } from '../../types'
import { bankAccountService, bankTransactionService } from '../../services/bankingService'

interface BankingState {
  accounts: BankAccount[]
  transactions: BankTransaction[]
  transactionsPagination: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: BankingState = {
  accounts: [],
  transactions: [],
  transactionsPagination: null,
  loading: false,
  error: null,
}

// Account thunks
export const fetchAccounts = createAsyncThunk(
  'banking/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      return await bankAccountService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts')
    }
  }
)

export const fetchAccountById = createAsyncThunk(
  'banking/fetchAccountById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await bankAccountService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account')
    }
  }
)

export const createAccount = createAsyncThunk(
  'banking/createAccount',
  async (data: Omit<BankAccount, 'id'>, { rejectWithValue }) => {
    try {
      return await bankAccountService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create account')
    }
  }
)

export const updateAccount = createAsyncThunk(
  'banking/updateAccount',
  async ({ id, data }: { id: string; data: Partial<BankAccount> }, { rejectWithValue }) => {
    try {
      return await bankAccountService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update account')
    }
  }
)

export const deleteAccount = createAsyncThunk(
  'banking/deleteAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      await bankAccountService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account')
    }
  }
)

// Transaction thunks
export const fetchTransactions = createAsyncThunk(
  'banking/fetchTransactions',
  async ({ accountId, page, perPage }: { accountId?: string; page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      return await bankTransactionService.getAll(accountId, { page, perPage })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const fetchTransactionById = createAsyncThunk(
  'banking/fetchTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await bankTransactionService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction')
    }
  }
)

export const createTransaction = createAsyncThunk(
  'banking/createTransaction',
  async (data: Omit<BankTransaction, 'id'>, { rejectWithValue }) => {
    try {
      return await bankTransactionService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction')
    }
  }
)

export const updateTransaction = createAsyncThunk(
  'banking/updateTransaction',
  async ({ id, data }: { id: string; data: Partial<BankTransaction> }, { rejectWithValue }) => {
    try {
      return await bankTransactionService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction')
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  'banking/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      await bankTransactionService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete transaction')
    }
  }
)

const bankingSlice = createSlice({
  name: 'banking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false
        state.accounts = action.payload
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload)
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(a => a.id === action.payload.id)
        if (index !== -1) {
          state.accounts[index] = action.payload
        }
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(a => a.id !== action.payload)
        state.transactions = state.transactions.filter(t => t.accountId !== action.payload)
      })
      // Transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.data
        state.transactionsPagination = action.payload.pagination || null
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.push(action.payload)
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.transactions[index] = action.payload
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload)
      })
  },
})

export const { clearError } = bankingSlice.actions
export default bankingSlice.reducer
