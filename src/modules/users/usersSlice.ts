import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '../../types'
import { userService } from '../../services/userService'

interface UsersState {
  users: User[]
  pagination: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params?: { page?: number; perPage?: number }, { rejectWithValue }) => {
    try {
      return await userService.getAll(params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await userService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/create',
  async (data: Omit<User, 'id' | 'dateCreated' | 'lastLogin'>, { rejectWithValue }) => {
    try {
      return await userService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      return await userService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

export const resetUserPassword = createAsyncThunk(
  'users/resetPassword',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.resetPassword(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password')
    }
  }
)

export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      return await userService.toggleStatus(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data
        state.pagination = action.payload.pagination || null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload)
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        // Password reset doesn't change the user object, just refresh
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
  },
})

export const { clearError } = usersSlice.actions
export default usersSlice.reducer
