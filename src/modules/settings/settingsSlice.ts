import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { PropertyType, BusinessType, TransactionCategory, ConstructionMaterial, Profile, Location, Vendor } from '../../types'
import {
  propertyTypeService,
  businessTypeService,
  transactionCategoryService,
  constructionMaterialService,
  profileService,
  locationService,
  vendorService,
} from '../../services/settingsService'
import { authService } from '../../services/authService'

interface SettingsState {
  profile: Profile | null
  propertyTypes: PropertyType[]
  businessTypes: BusinessType[]
  transactionCategories: TransactionCategory[]
  constructionMaterials: ConstructionMaterial[]
  locations: Location[]
  vendors: Vendor[]
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  profile: null,
  propertyTypes: [],
  businessTypes: [],
  transactionCategories: [],
  constructionMaterials: [],
  locations: [],
  vendors: [],
  loading: false,
  error: null,
}

// Profile thunks
export const fetchProfile = createAsyncThunk(
  'settings/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.get()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

export const createProfile = createAsyncThunk(
  'settings/createProfile',
  async (data: Omit<Profile, 'id'>, { rejectWithValue }) => {
    try {
      return await profileService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create profile')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'settings/updateProfile',
  async (data: Partial<Profile>, { rejectWithValue }) => {
    try {
      return await profileService.update(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const updatePassword = createAsyncThunk(
  'settings/updatePassword',
  async (data: { currentPassword: string; password: string; passwordConfirmation: string }, { rejectWithValue }) => {
    try {
      await authService.updatePassword(data)
      return true
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.errors || 'Failed to update password')
    }
  }
)

// Property Types thunks
export const fetchPropertyTypes = createAsyncThunk(
  'settings/fetchPropertyTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await propertyTypeService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property types')
    }
  }
)

export const createPropertyType = createAsyncThunk(
  'settings/createPropertyType',
  async (data: Omit<PropertyType, 'id' | 'dateCreated'>, { rejectWithValue }) => {
    try {
      return await propertyTypeService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create property type')
    }
  }
)

export const updatePropertyType = createAsyncThunk(
  'settings/updatePropertyType',
  async ({ id, data }: { id: string; data: Partial<PropertyType> }, { rejectWithValue }) => {
    try {
      return await propertyTypeService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property type')
    }
  }
)

export const deletePropertyType = createAsyncThunk(
  'settings/deletePropertyType',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyTypeService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property type')
    }
  }
)

// Business Types thunks
export const fetchBusinessTypes = createAsyncThunk(
  'settings/fetchBusinessTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await businessTypeService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch business types')
    }
  }
)

export const createBusinessType = createAsyncThunk(
  'settings/createBusinessType',
  async (data: Omit<BusinessType, 'id' | 'dateCreated'>, { rejectWithValue }) => {
    try {
      return await businessTypeService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create business type')
    }
  }
)

export const updateBusinessType = createAsyncThunk(
  'settings/updateBusinessType',
  async ({ id, data }: { id: string; data: Partial<BusinessType> }, { rejectWithValue }) => {
    try {
      return await businessTypeService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update business type')
    }
  }
)

export const deleteBusinessType = createAsyncThunk(
  'settings/deleteBusinessType',
  async (id: string, { rejectWithValue }) => {
    try {
      await businessTypeService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete business type')
    }
  }
)

// Transaction Categories thunks
export const fetchTransactionCategories = createAsyncThunk(
  'settings/fetchTransactionCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await transactionCategoryService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction categories')
    }
  }
)

export const createTransactionCategory = createAsyncThunk(
  'settings/createTransactionCategory',
  async (data: Omit<TransactionCategory, 'id' | 'dateCreated'>, { rejectWithValue }) => {
    try {
      return await transactionCategoryService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction category')
    }
  }
)

export const updateTransactionCategory = createAsyncThunk(
  'settings/updateTransactionCategory',
  async ({ id, data }: { id: string; data: Partial<TransactionCategory> }, { rejectWithValue }) => {
    try {
      return await transactionCategoryService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction category')
    }
  }
)

export const deleteTransactionCategory = createAsyncThunk(
  'settings/deleteTransactionCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionCategoryService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete transaction category')
    }
  }
)

// Construction Materials thunks
export const fetchConstructionMaterials = createAsyncThunk(
  'settings/fetchConstructionMaterials',
  async (_, { rejectWithValue }) => {
    try {
      return await constructionMaterialService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch construction materials')
    }
  }
)

export const createConstructionMaterial = createAsyncThunk(
  'settings/createConstructionMaterial',
  async (data: Omit<ConstructionMaterial, 'id' | 'dateCreated'>, { rejectWithValue }) => {
    try {
      return await constructionMaterialService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create construction material')
    }
  }
)

export const updateConstructionMaterial = createAsyncThunk(
  'settings/updateConstructionMaterial',
  async ({ id, data }: { id: string; data: Partial<ConstructionMaterial> }, { rejectWithValue }) => {
    try {
      return await constructionMaterialService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update construction material')
    }
  }
)

export const deleteConstructionMaterial = createAsyncThunk(
  'settings/deleteConstructionMaterial',
  async (id: string, { rejectWithValue }) => {
    try {
      await constructionMaterialService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete construction material')
    }
  }
)

// Locations thunks
export const fetchLocations = createAsyncThunk(
  'settings/fetchLocations',
  async (_, { rejectWithValue }) => {
    try {
      return await locationService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch locations')
    }
  }
)

export const createLocation = createAsyncThunk(
  'settings/createLocation',
  async (data: Omit<Location, 'id' | 'dateCreated'>, { rejectWithValue }) => {
    try {
      return await locationService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create location')
    }
  }
)

export const updateLocation = createAsyncThunk(
  'settings/updateLocation',
  async ({ id, data }: { id: string; data: Partial<Location> }, { rejectWithValue }) => {
    try {
      return await locationService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location')
    }
  }
)

export const deleteLocation = createAsyncThunk(
  'settings/deleteLocation',
  async (id: string, { rejectWithValue }) => {
    try {
      await locationService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete location')
    }
  }
)

// Vendors thunks
export const fetchVendors = createAsyncThunk(
  'settings/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      return await vendorService.getAll()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vendors')
    }
  }
)

export const createVendor = createAsyncThunk(
  'settings/createVendor',
  async (data: Omit<Vendor, 'id'>, { rejectWithValue }) => {
    try {
      return await vendorService.create(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create vendor')
    }
  }
)

export const updateVendor = createAsyncThunk(
  'settings/updateVendor',
  async ({ id, data }: { id: string; data: Partial<Vendor> }, { rejectWithValue }) => {
    try {
      return await vendorService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update vendor')
    }
  }
)

export const deleteVendor = createAsyncThunk(
  'settings/deleteVendor',
  async (id: string, { rejectWithValue }) => {
    try {
      await vendorService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete vendor')
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      // Property Types
      .addCase(fetchPropertyTypes.fulfilled, (state, action) => {
        state.propertyTypes = action.payload
      })
      .addCase(createPropertyType.fulfilled, (state, action) => {
        state.propertyTypes.push(action.payload)
      })
      .addCase(updatePropertyType.fulfilled, (state, action) => {
        const index = state.propertyTypes.findIndex(pt => pt.id === action.payload.id)
        if (index !== -1) {
          state.propertyTypes[index] = action.payload
        }
      })
      .addCase(deletePropertyType.fulfilled, (state, action) => {
        state.propertyTypes = state.propertyTypes.filter(pt => pt.id !== action.payload)
      })
      // Business Types
      .addCase(fetchBusinessTypes.fulfilled, (state, action) => {
        state.businessTypes = action.payload
      })
      .addCase(createBusinessType.fulfilled, (state, action) => {
        state.businessTypes.push(action.payload)
      })
      .addCase(updateBusinessType.fulfilled, (state, action) => {
        const index = state.businessTypes.findIndex(bt => bt.id === action.payload.id)
        if (index !== -1) {
          state.businessTypes[index] = action.payload
        }
      })
      .addCase(deleteBusinessType.fulfilled, (state, action) => {
        state.businessTypes = state.businessTypes.filter(bt => bt.id !== action.payload)
      })
      // Transaction Categories
      .addCase(fetchTransactionCategories.fulfilled, (state, action) => {
        state.transactionCategories = action.payload
      })
      .addCase(createTransactionCategory.fulfilled, (state, action) => {
        state.transactionCategories.push(action.payload)
      })
      .addCase(updateTransactionCategory.fulfilled, (state, action) => {
        const index = state.transactionCategories.findIndex(tc => tc.id === action.payload.id)
        if (index !== -1) {
          state.transactionCategories[index] = action.payload
        }
      })
      .addCase(deleteTransactionCategory.fulfilled, (state, action) => {
        state.transactionCategories = state.transactionCategories.filter(tc => tc.id !== action.payload)
      })
      // Construction Materials
      .addCase(fetchConstructionMaterials.fulfilled, (state, action) => {
        state.constructionMaterials = action.payload
      })
      .addCase(createConstructionMaterial.fulfilled, (state, action) => {
        state.constructionMaterials.push(action.payload)
      })
      .addCase(updateConstructionMaterial.fulfilled, (state, action) => {
        const index = state.constructionMaterials.findIndex(cm => cm.id === action.payload.id)
        if (index !== -1) {
          state.constructionMaterials[index] = action.payload
        }
      })
      .addCase(deleteConstructionMaterial.fulfilled, (state, action) => {
        state.constructionMaterials = state.constructionMaterials.filter(cm => cm.id !== action.payload)
      })
      // Locations
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations = action.payload
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.locations.push(action.payload)
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.locations.findIndex(l => l.id === action.payload.id)
        if (index !== -1) {
          state.locations[index] = action.payload
        }
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations = state.locations.filter(l => l.id !== action.payload)
      })
      // Vendors
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendors = action.payload
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.push(action.payload)
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v.id === action.payload.id)
        if (index !== -1) {
          state.vendors[index] = action.payload
        }
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(v => v.id !== action.payload)
      })
  },
})

export const { clearError } = settingsSlice.actions
export default settingsSlice.reducer
