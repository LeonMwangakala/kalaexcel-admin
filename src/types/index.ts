export interface Property {
  id: string
  name: string
  propertyTypeId?: string
  locationId?: string
  size: string
  status: 'available' | 'occupied'
  monthlyRent: number
  dateAdded: string
}

export interface Tenant {
  id: string
  name: string
  phone: string
  idNumber: string
  businessType: string
  propertyIds?: string[]
  contractStartDate?: string // Managed in contracts module
  contractEndDate?: string // Managed in contracts module
  status: 'active' | 'ended' | 'pending_payment'
}

export interface Contract {
  id: string
  contractNumber?: string
  tenantId: string
  propertyId: string
  rentAmount: number
  startDate: string
  endDate: string
  terms: string
  status: 'active' | 'expired' | 'terminated'
}

export interface RentPayment {
  id: string
  tenantId: string
  contractId?: string
  bankAccountId?: string
  amount: number
  month: string
  paymentDate: string
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card'
  bankReceipt?: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
}

export interface ConstructionProject {
  id: string
  name: string
  description: string
  startDate: string
  endDate?: string
  budget: number
  totalSpent: number
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
}

export interface ConstructionExpense {
  id: string
  projectId: string
  type: 'materials' | 'labor' | 'equipment'
  materialId?: string
  quantity?: number
  unitPrice?: number
  amount: number
  date: string
  vendorId: string
  bankAccountId: string
  description: string
  receiptUrl?: string
}

export interface BankAccount {
  id: string
  accountName: string
  bankName: string
  branchName: string
  accountNumber: string
  openingBalance: number
  type: 'checking' | 'savings' | 'business'
}

export interface BankTransaction {
  id: string
  accountId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  description: string
  category: string
  reference?: string
}

// Public Toilet Collection Module
export interface ToiletCollection {
  id: string
  date: string
  totalUsers: number
  amountCollected: number
  cashierId: string
  cashier?: User
  bankAccountId: string
  bankAccount?: BankAccount
  depositId?: string
  depositDate?: string
  isDeposited: boolean
  notes?: string
}

// Water Supply Subscription Module
export interface WaterSupplyCustomer {
  id: string
  name: string
  phone: string
  location: string
  meterNumber: string
  startingReading: number
  unitPrice: number
  status: 'active' | 'inactive'
  dateRegistered: string
}

export interface WaterSupplyReading {
  id: string
  customerId: string
  customer?: WaterSupplyCustomer
  readingDate: string
  meterReading: number
  previousReading: number
  unitsConsumed: number
  amountDue: number
  paymentStatus: 'paid' | 'pending' | 'overdue'
  paymentDate?: string
  month: string // Format: YYYY-MM
}

export interface WaterSupplyPayment {
  id: string
  readingId: string
  customerId: string
  amount: number
  paymentDate: string
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card'
  bankAccountId?: string
  bankAccount?: BankAccount
  bankReceipt?: string
  reference?: string
}

// Water Well Daily Collection Module
export interface WaterWellCollection {
  id: string
  date: string
  bucketsSold: number
  unitPrice: number
  totalAmount: number
  operatorId: string
  operator?: User
  bankAccountId: string
  bankAccount?: BankAccount
  depositId?: string
  depositDate?: string
  isDeposited: boolean
  notes?: string
}

// User Module
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'operator' | 'cashier'
  status: 'active' | 'inactive'
  dateCreated: string
  lastLogin?: string
  password?: string // Only for form, not stored in list
}

// Settings Module
export interface PropertyType {
  id: string
  name: string
  description?: string
  dateCreated: string
}

export interface BusinessType {
  id: string
  name: string
  description?: string
  dateCreated: string
}

export interface TransactionCategory {
  id: string
  name: string
  type: 'income' | 'expense'
  description?: string
  dateCreated: string
}

export interface ConstructionMaterial {
  id: string
  name: string
  unit: string // e.g., 'kg', 'pieces', 'liters', 'bags'
  description?: string
  dateCreated: string
}

export interface Profile {
  id: string
  companyName: string
  email: string
  phone: string
  address: string
  taxId?: string
  registrationNumber?: string
  logo?: string
}

export interface Vendor {
  id: string
  name: string
  location: string
  phone: string
}