import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../modules/auth/authSlice'
import propertiesReducer from '../modules/property/propertySlice'
import tenantsReducer from '../modules/tenants/tenantsSlice'
import contractsReducer from '../modules/contracts/contractsSlice'
import rentReducer from '../modules/rent/rentSlice'
import constructionReducer from '../modules/construction/constructionSlice'
import bankingReducer from '../modules/banking/bankingSlice'
import toiletReducer from '../modules/toilet/toiletSlice'
import waterSupplyReducer from '../modules/waterSupply/waterSupplySlice'
import waterWellReducer from '../modules/waterWell/waterWellSlice'
import usersReducer from '../modules/users/usersSlice'
import settingsReducer from '../modules/settings/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    tenants: tenantsReducer,
    contracts: contractsReducer,
    rent: rentReducer,
    construction: constructionReducer,
    banking: bankingReducer,
    toilet: toiletReducer,
    waterSupply: waterSupplyReducer,
    waterWell: waterWellReducer,
    users: usersReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch