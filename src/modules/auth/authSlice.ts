import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService, LoginCredentials, RegisterData, AuthResponse } from '../../services/authService'
import { User } from '../../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: authService.getStoredUser(),
  token: authService.getStoredToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error: any) {
      // Handle validation errors from Laravel
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.email?.[0]
        || error.response?.data?.errors?.password?.[0]
        || error.message
        || 'Login failed. Please check your credentials.'
      return rejectWithValue(errorMessage)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      )
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return user
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user as User
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user as User
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload as User
        state.isAuthenticated = true
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer

