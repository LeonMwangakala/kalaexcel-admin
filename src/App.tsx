import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/admin/AdminLayout'
import Dashboard from './modules/dashboard/Dashboard'
import PropertyList from './modules/property/PropertyList'
import PropertyForm from './modules/property/PropertyForm'
import TenantList from './modules/tenants/TenantList'
import TenantForm from './modules/tenants/TenantForm'
import ContractList from './modules/contracts/ContractList'
import ContractForm from './modules/contracts/ContractForm'
import Rent from './modules/rent/Rent'
import RentForm from './modules/rent/RentForm'
import ConstructionList from './modules/construction/ConstructionList'
import ConstructionForm from './modules/construction/ConstructionForm'
import ConstructionDetail from './modules/construction/ConstructionDetail'
import BankingList from './modules/banking/BankingList'
import BankingForm from './modules/banking/BankingForm'
import BankAccountForm from './modules/banking/BankAccountForm'
import ToiletList from './modules/toilet/ToiletList'
import ToiletForm from './modules/toilet/ToiletForm'
import WaterSupplyCustomerList from './modules/waterSupply/WaterSupplyCustomerList'
import WaterSupplyCustomerForm from './modules/waterSupply/WaterSupplyCustomerForm'
import WaterSupplyCustomerReadings from './modules/waterSupply/WaterSupplyCustomerReadings'
import WaterSupplyReadingList from './modules/waterSupply/WaterSupplyReadingList'
import WaterSupplyReadingForm from './modules/waterSupply/WaterSupplyReadingForm'
import WaterSupplyPaymentForm from './modules/waterSupply/WaterSupplyPaymentForm'
import WaterWellList from './modules/waterWell/WaterWellList'
import WaterWellForm from './modules/waterWell/WaterWellForm'
import UserList from './modules/users/UserList'
import UserForm from './modules/users/UserForm'
import Settings from './modules/settings/Settings'
import Login from './modules/auth/Login'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/new" element={<PropertyForm />} />
              <Route path="/properties/:id/edit" element={<PropertyForm />} />
              <Route path="/tenants" element={<TenantList />} />
              <Route path="/tenants/new" element={<TenantForm />} />
              <Route path="/tenants/:id/edit" element={<TenantForm />} />
              <Route path="/contracts" element={<ContractList />} />
              <Route path="/contracts/new" element={<ContractForm />} />
              <Route path="/contracts/:id/edit" element={<ContractForm />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/rent/new" element={<RentForm />} />
              <Route path="/rent/:id/edit" element={<RentForm />} />
              <Route path="/construction" element={<ConstructionList />} />
              <Route path="/construction/new" element={<ConstructionForm />} />
              <Route path="/construction/:id" element={<ConstructionDetail />} />
              <Route path="/construction/:id/edit" element={<ConstructionForm />} />
              <Route path="/banking" element={<BankingList />} />
              <Route path="/banking/account/new" element={<BankAccountForm />} />
              <Route path="/banking/account/:id/edit" element={<BankAccountForm />} />
              <Route path="/banking/new" element={<BankingForm />} />
              <Route path="/banking/:id/edit" element={<BankingForm />} />
              <Route path="/toilet" element={<ToiletList />} />
              <Route path="/toilet/new" element={<ToiletForm />} />
              <Route path="/toilet/:id/edit" element={<ToiletForm />} />
              <Route path="/water-supply/customers" element={<WaterSupplyCustomerList />} />
              <Route path="/water-supply/customers/new" element={<WaterSupplyCustomerForm />} />
              <Route path="/water-supply/customers/:id/edit" element={<WaterSupplyCustomerForm />} />
              <Route path="/water-supply/customers/:id/readings" element={<WaterSupplyCustomerReadings />} />
              <Route path="/water-supply/readings" element={<WaterSupplyReadingList />} />
              <Route path="/water-supply/readings/new" element={<WaterSupplyReadingForm />} />
              <Route path="/water-supply/readings/:id/edit" element={<WaterSupplyReadingForm />} />
              <Route path="/water-supply/readings/:id/payment" element={<WaterSupplyPaymentForm />} />
              <Route path="/water-well" element={<WaterWellList />} />
              <Route path="/water-well/new" element={<WaterWellForm />} />
              <Route path="/water-well/:id/edit" element={<WaterWellForm />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id/edit" element={<UserForm />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App