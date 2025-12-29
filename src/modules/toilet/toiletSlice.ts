import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ToiletCollection } from '../../types'
import { toiletCollectionService } from '../../services/toiletService'

interface ToiletState {
  collections: ToiletCollection[]
  pagination: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: ToiletState = {
  collections: [],
  pagination: null,
  loading: false,
  error: null,
}

export const fetchCollections = createAsyncThunk(
  'toilet/fetchAll',
  async (params?: { page?: number; perPage?: number }, { rejectWithValue }) => {
    try {
      return await toiletCollectionService.getAll(params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collections')
    }
  }
)

export const fetchCollectionById = createAsyncThunk(
  'toilet/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await toiletCollectionService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collection')
    }
  }
)

export const createCollection = createAsyncThunk(
  'toilet/create',
  async (data: Omit<ToiletCollection, 'id'>, { rejectWithValue }) => {
    try {
      return await toiletCollectionService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create collection')
    }
  }
)

export const updateCollection = createAsyncThunk(
  'toilet/update',
  async ({ id, data }: { id: string; data: Partial<ToiletCollection> }, { rejectWithValue }) => {
    try {
      return await toiletCollectionService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update collection')
    }
  }
)

export const deleteCollection = createAsyncThunk(
  'toilet/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await toiletCollectionService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete collection')
    }
  }
)

export const markAsDeposited = createAsyncThunk(
  'toilet/markAsDeposited',
  async ({ id, depositId, depositDate }: { id: string; depositId: string; depositDate: string }, { rejectWithValue }) => {
    try {
      return await toiletCollectionService.update(id, {
        isDeposited: true,
        depositId,
        depositDate,
      })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as deposited')
    }
  }
)

const toiletSlice = createSlice({
  name: 'toilet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false
        state.collections = action.payload.data
        state.pagination = action.payload.pagination || null
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload)
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.collections[index] = action.payload
        }
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter(c => c.id !== action.payload)
      })
      .addCase(markAsDeposited.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.collections[index] = action.payload
        }
      })
  },
})

export const { clearError } = toiletSlice.actions
export default toiletSlice.reducer
