import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ConstructionProject, ConstructionExpense } from '../../types'
import { constructionProjectService, constructionExpenseService } from '../../services/constructionService'

interface ConstructionState {
  projects: ConstructionProject[]
  projectsPagination: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  } | null
  expenses: ConstructionExpense[]
  expensesPagination: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: ConstructionState = {
  projects: [],
  projectsPagination: null,
  expenses: [],
  expensesPagination: null,
  loading: false,
  error: null,
}

// Project thunks
export const fetchProjects = createAsyncThunk(
  'construction/fetchProjects',
  async (params?: { page?: number; perPage?: number }, { rejectWithValue }) => {
    try {
      return await constructionProjectService.getAll(params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects')
    }
  }
)

export const fetchProjectById = createAsyncThunk(
  'construction/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await constructionProjectService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project')
    }
  }
)

export const createProject = createAsyncThunk(
  'construction/createProject',
  async (data: Omit<ConstructionProject, 'id'>, { rejectWithValue }) => {
    try {
      return await constructionProjectService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project')
    }
  }
)

export const updateProject = createAsyncThunk(
  'construction/updateProject',
  async ({ id, data }: { id: string; data: Partial<ConstructionProject> }, { rejectWithValue }) => {
    try {
      return await constructionProjectService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project')
    }
  }
)

export const deleteProject = createAsyncThunk(
  'construction/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await constructionProjectService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project')
    }
  }
)

// Expense thunks
export const fetchExpenses = createAsyncThunk(
  'construction/fetchExpenses',
  async ({ projectId, page, perPage }: { projectId?: string; page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      return await constructionExpenseService.getAll(projectId, { page, perPage })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses')
    }
  }
)

export const fetchExpenseById = createAsyncThunk(
  'construction/fetchExpenseById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await constructionExpenseService.getById(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense')
    }
  }
)

export const createExpense = createAsyncThunk(
  'construction/createExpense',
  async (data: Omit<ConstructionExpense, 'id'>, { rejectWithValue }) => {
    try {
      return await constructionExpenseService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense')
    }
  }
)

export const updateExpense = createAsyncThunk(
  'construction/updateExpense',
  async ({ id, data }: { id: string; data: Partial<ConstructionExpense> }, { rejectWithValue }) => {
    try {
      return await constructionExpenseService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense')
    }
  }
)

export const deleteExpense = createAsyncThunk(
  'construction/deleteExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      await constructionExpenseService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense')
    }
  }
)

const constructionSlice = createSlice({
  name: 'construction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.data
        state.projectsPagination = action.payload.pagination || null
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        } else {
          state.projects.push(action.payload)
        }
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload)
        state.expenses = state.expenses.filter(e => e.projectId !== action.payload)
      })
      // Expenses
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload.data
        state.expensesPagination = action.payload.pagination || null
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload)
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.expenses[index] = action.payload
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload)
      })
  },
})

export const { clearError } = constructionSlice.actions
export default constructionSlice.reducer
