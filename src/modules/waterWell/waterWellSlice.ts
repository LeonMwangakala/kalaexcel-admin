import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { WaterWellCollection } from '../../types'
import { waterWellCollectionService } from '../../services/waterWellService'

interface WaterWellState {
  collections: WaterWellCollection[]
  loading: boolean
  error: string | null
  collectionsPagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  } | null
}

const initialState: WaterWellState = {
  collections: [],
  loading: false,
  error: null,
  collectionsPagination: null,
}

export const fetchCollections = createAsyncThunk(
  'waterWell/fetchAll',
  async ({ page, perPage }: { page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      return await waterWellCollectionService.getAll({ page, perPage })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collections')
    }
  }
)

export const fetchCollectionById = createAsyncThunk(
  'waterWell/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await waterWellCollectionService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collection')
    }
  }
)

export const createCollection = createAsyncThunk(
  'waterWell/create',
  async (data: Omit<WaterWellCollection, 'id'>, { rejectWithValue }) => {
    try {
      return await waterWellCollectionService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create collection')
    }
  }
)

export const updateCollection = createAsyncThunk(
  'waterWell/update',
  async ({ id, data }: { id: string; data: Partial<WaterWellCollection> }, { rejectWithValue }) => {
    try {
      return await waterWellCollectionService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update collection')
    }
  }
)

export const deleteCollection = createAsyncThunk(
  'waterWell/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await waterWellCollectionService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete collection')
    }
  }
)

export const markAsDeposited = createAsyncThunk(
  'waterWell/markAsDeposited',
  async ({ id, depositId, depositDate }: { id: string; depositId: string; depositDate: string }, { rejectWithValue }) => {
    try {
      return await waterWellCollectionService.update(id, {
        isDeposited: true,
        depositId,
        depositDate,
      })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as deposited')
    }
  }
)

const waterWellSlice = createSlice({
  name: 'waterWell',
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
        state.collectionsPagination = action.payload.pagination
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

export const { clearError } = waterWellSlice.actions
export default waterWellSlice.reducer
