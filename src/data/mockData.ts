import { 
  Property, 
  Tenant, 
  Contract, 
  RentPayment, 
  ConstructionProject, 
  ConstructionExpense, 
  BankAccount, 
  BankTransaction,
  ToiletCollection,
  WaterSupplyCustomer,
  WaterSupplyReading,
  WaterSupplyPayment,
  WaterWellCollection,
  User,
  PropertyType,
  BusinessType,
  TransactionCategory,
  ConstructionMaterial,
  Profile
} from '../types'

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Shop A1',
    location: 'Downtown Mall, Ground Floor',
    size: '120 sq ft',
    status: 'occupied',
    monthlyRent: 2500,
    dateAdded: '2024-01-15',
    tenantId: '1'
  },
  {
    id: '2',
    name: 'Shop B2',
    location: 'Downtown Mall, First Floor',
    size: '150 sq ft',
    status: 'occupied',
    monthlyRent: 3000,
    dateAdded: '2024-02-01',
    tenantId: '2'
  },
  {
    id: '3',
    name: 'Shop C3',
    location: 'Downtown Mall, Second Floor',
    size: '100 sq ft',
    status: 'available',
    monthlyRent: 2000,
    dateAdded: '2024-03-10'
  },
  {
    id: '4',
    name: 'Shop D4',
    location: 'City Center, Main Street',
    size: '200 sq ft',
    status: 'occupied',
    monthlyRent: 4500,
    dateAdded: '2024-01-20',
    tenantId: '3'
  },
  {
    id: '5',
    name: 'Shop E5',
    location: 'City Center, Side Street',
    size: '80 sq ft',
    status: 'available',
    monthlyRent: 1500,
    dateAdded: '2024-04-05'
  }
]

export const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    phone: '+1-555-0123',
    idNumber: 'ID123456789',
    businessType: 'Electronics Store',
    propertyId: '1',
    contractStartDate: '2024-01-20',
    contractEndDate: '2025-01-20',
    status: 'active'
  },
  {
    id: '2',
    name: 'Fatima Al-Zahra',
    phone: '+1-555-0124',
    idNumber: 'ID987654321',
    businessType: 'Clothing Boutique',
    propertyId: '2',
    contractStartDate: '2024-02-15',
    contractEndDate: '2025-02-15',
    status: 'active'
  },
  {
    id: '3',
    name: 'Omar Ali',
    phone: '+1-555-0125',
    idNumber: 'ID456789123',
    businessType: 'Restaurant',
    propertyId: '4',
    contractStartDate: '2024-02-01',
    contractEndDate: '2025-02-01',
    status: 'pending_payment'
  }
]

export const mockContracts: Contract[] = [
  {
    id: '1',
    tenantId: '1',
    propertyId: '1',
    rentAmount: 2500,
    startDate: '2024-01-20',
    endDate: '2025-01-20',
    terms: 'Standard commercial lease terms apply. Tenant responsible for utilities.',
    status: 'active'
  },
  {
    id: '2',
    tenantId: '2',
    propertyId: '2',
    rentAmount: 3000,
    startDate: '2024-02-15',
    endDate: '2025-02-15',
    terms: 'Premium location lease. Tenant responsible for insurance.',
    status: 'active'
  },
  {
    id: '3',
    tenantId: '3',
    propertyId: '4',
    rentAmount: 4500,
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    terms: 'Restaurant lease. Special provisions for kitchen equipment.',
    status: 'active'
  }
]

export const mockRentPayments: RentPayment[] = [
  {
    id: '1',
    tenantId: '1',
    amount: 2500,
    month: '2024-12',
    paymentDate: '2024-12-01',
    paymentMethod: 'bank_transfer',
    status: 'paid'
  },
  {
    id: '2',
    tenantId: '1',
    amount: 2500,
    month: '2024-11',
    paymentDate: '2024-11-01',
    paymentMethod: 'bank_transfer',
    status: 'paid'
  },
  {
    id: '3',
    tenantId: '2',
    amount: 3000,
    month: '2024-12',
    paymentDate: '2024-12-05',
    paymentMethod: 'cash',
    status: 'paid'
  },
  {
    id: '4',
    tenantId: '3',
    amount: 4500,
    month: '2024-12',
    paymentDate: '',
    paymentMethod: 'bank_transfer',
    status: 'overdue'
  },
  {
    id: '5',
    tenantId: '1',
    amount: 2500,
    month: '2024-10',
    paymentDate: '2024-10-01',
    paymentMethod: 'bank_transfer',
    status: 'paid'
  }
]

export const mockConstructionProjects: ConstructionProject[] = [
  {
    id: '1',
    name: 'New Shopping Complex Phase 1',
    description: 'Construction of 10 new retail shops',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    budget: 500000,
    totalSpent: 325000,
    status: 'in_progress',
    progress: 65
  },
  {
    id: '2',
    name: 'Mall Renovation',
    description: 'Renovation of existing mall facilities',
    startDate: '2024-09-01',
    budget: 150000,
    totalSpent: 45000,
    status: 'in_progress',
    progress: 30
  }
]

export const mockConstructionExpenses: ConstructionExpense[] = [
  {
    id: '1',
    projectId: '1',
    type: 'Materials',
    amount: 85000,
    date: '2024-06-15',
    vendor: 'BuildMax Supplies',
    description: 'Cement, steel, and construction materials'
  },
  {
    id: '2',
    projectId: '1',
    type: 'Labor',
    amount: 120000,
    date: '2024-07-01',
    vendor: 'Elite Construction Team',
    description: 'Foundation and structural work'
  },
  {
    id: '3',
    projectId: '1',
    type: 'Equipment',
    amount: 45000,
    date: '2024-07-15',
    vendor: 'Heavy Machinery Rental Co.',
    description: 'Excavator and crane rental'
  },
  {
    id: '4',
    projectId: '1',
    type: 'Electrical',
    amount: 35000,
    date: '2024-08-01',
    vendor: 'Power Solutions Inc.',
    description: 'Electrical wiring and fixtures'
  },
  {
    id: '5',
    projectId: '2',
    type: 'Materials',
    amount: 25000,
    date: '2024-09-10',
    vendor: 'Renovation Supplies Ltd.',
    description: 'Flooring and wall materials'
  }
]

export const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    name: 'Business Operating Account',
    bankName: 'First National Bank',
    accountNumber: '****1234',
    balance: 125000,
    type: 'business'
  },
  {
    id: '2',
    name: 'Construction Fund',
    bankName: 'First National Bank',
    accountNumber: '****5678',
    balance: 75000,
    type: 'business'
  },
  {
    id: '3',
    name: 'Savings Account',
    bankName: 'City Credit Union',
    accountNumber: '****9012',
    balance: 50000,
    type: 'savings'
  }
]

export const mockBankTransactions: BankTransaction[] = [
  {
    id: '1',
    accountId: '1',
    type: 'deposit',
    amount: 5500,
    date: '2024-12-01',
    description: 'Rent payment - Shop A1',
    category: 'Rent Income',
    reference: 'RENT-001'
  },
  {
    id: '2',
    accountId: '1',
    type: 'deposit',
    amount: 3000,
    date: '2024-12-05',
    description: 'Rent payment - Shop B2',
    category: 'Rent Income',
    reference: 'RENT-002'
  },
  {
    id: '3',
    accountId: '1',
    type: 'withdrawal',
    amount: 12000,
    date: '2024-12-02',
    description: 'Construction materials payment',
    category: 'Construction',
    reference: 'CONST-001'
  },
  {
    id: '4',
    accountId: '1',
    type: 'deposit',
    amount: 2500,
    date: '2024-11-01',
    description: 'Rent payment - Shop A1',
    category: 'Rent Income',
    reference: 'RENT-011'
  },
  {
    id: '5',
    accountId: '2',
    type: 'withdrawal',
    amount: 35000,
    date: '2024-08-01',
    description: 'Electrical work payment',
    category: 'Construction',
    reference: 'CONST-002'
  }
]

// Public Toilet Collection Mock Data
export const mockToiletCollections: ToiletCollection[] = [
  {
    id: '1',
    date: '2024-12-15',
    totalUsers: 145,
    amountCollected: 1450,
    cashier: 'John Doe',
    depositId: 'DEP-001',
    depositDate: '2024-12-15',
    isDeposited: true,
    notes: 'Normal day'
  },
  {
    id: '2',
    date: '2024-12-14',
    totalUsers: 132,
    amountCollected: 1320,
    cashier: 'Jane Smith',
    depositId: 'DEP-002',
    depositDate: '2024-12-14',
    isDeposited: true
  },
  {
    id: '3',
    date: '2024-12-13',
    totalUsers: 158,
    amountCollected: 1580,
    cashier: 'John Doe',
    depositId: 'DEP-003',
    depositDate: '2024-12-13',
    isDeposited: true
  },
  {
    id: '4',
    date: '2024-12-12',
    totalUsers: 120,
    amountCollected: 1200,
    cashier: 'Jane Smith',
    isDeposited: false,
    notes: 'Pending deposit'
  },
  {
    id: '5',
    date: '2024-12-11',
    totalUsers: 140,
    amountCollected: 1400,
    cashier: 'John Doe',
    depositId: 'DEP-004',
    depositDate: '2024-12-11',
    isDeposited: true
  }
]

// Water Supply Subscription Mock Data
export const mockWaterSupplyCustomers: WaterSupplyCustomer[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    phone: '+1-555-0201',
    location: 'Downtown Area, Block A',
    meterNumber: 'WS-001',
    startingReading: 0,
    unitPrice: 2.5,
    status: 'active',
    dateRegistered: '2024-01-15'
  },
  {
    id: '2',
    name: 'Fatima Al-Zahra',
    phone: '+1-555-0202',
    location: 'Residential Zone, Street 5',
    meterNumber: 'WS-002',
    startingReading: 0,
    unitPrice: 2.5,
    status: 'active',
    dateRegistered: '2024-02-01'
  },
  {
    id: '3',
    name: 'Omar Ali',
    phone: '+1-555-0203',
    location: 'Commercial District, Unit 12',
    meterNumber: 'WS-003',
    startingReading: 0,
    unitPrice: 3.0,
    status: 'active',
    dateRegistered: '2024-02-10'
  },
  {
    id: '4',
    name: 'Sara Mohamed',
    phone: '+1-555-0204',
    location: 'Suburban Area, House 8',
    meterNumber: 'WS-004',
    startingReading: 0,
    unitPrice: 2.5,
    status: 'active',
    dateRegistered: '2024-03-05'
  }
]

export const mockWaterSupplyReadings: WaterSupplyReading[] = [
  {
    id: '1',
    customerId: '1',
    readingDate: '2024-12-01',
    meterReading: 1250,
    previousReading: 1200,
    unitsConsumed: 50,
    amountDue: 125,
    paymentStatus: 'paid',
    paymentDate: '2024-12-05',
    month: '2024-12'
  },
  {
    id: '2',
    customerId: '2',
    readingDate: '2024-12-01',
    meterReading: 980,
    previousReading: 950,
    unitsConsumed: 30,
    amountDue: 75,
    paymentStatus: 'paid',
    paymentDate: '2024-12-03',
    month: '2024-12'
  },
  {
    id: '3',
    customerId: '3',
    readingDate: '2024-12-01',
    meterReading: 2100,
    previousReading: 2050,
    unitsConsumed: 50,
    amountDue: 150,
    paymentStatus: 'pending',
    month: '2024-12'
  },
  {
    id: '4',
    customerId: '4',
    readingDate: '2024-12-01',
    meterReading: 750,
    previousReading: 720,
    unitsConsumed: 30,
    amountDue: 75,
    paymentStatus: 'paid',
    paymentDate: '2024-12-02',
    month: '2024-12'
  },
  {
    id: '5',
    customerId: '1',
    readingDate: '2024-11-01',
    meterReading: 1200,
    previousReading: 1150,
    unitsConsumed: 50,
    amountDue: 125,
    paymentStatus: 'paid',
    paymentDate: '2024-11-05',
    month: '2024-11'
  }
]

export const mockWaterSupplyPayments: WaterSupplyPayment[] = [
  {
    id: '1',
    readingId: '1',
    customerId: '1',
    amount: 125,
    paymentDate: '2024-12-05',
    paymentMethod: 'bank_transfer',
    reference: 'WS-PAY-001'
  },
  {
    id: '2',
    readingId: '2',
    customerId: '2',
    amount: 75,
    paymentDate: '2024-12-03',
    paymentMethod: 'cash',
    reference: 'WS-PAY-002'
  },
  {
    id: '3',
    readingId: '4',
    customerId: '4',
    amount: 75,
    paymentDate: '2024-12-02',
    paymentMethod: 'bank_transfer',
    reference: 'WS-PAY-003'
  }
]

// Water Well Daily Collection Mock Data
export const mockWaterWellCollections: WaterWellCollection[] = [
  {
    id: '1',
    date: '2024-12-15',
    bucketsSold: 320,
    unitPrice: 5,
    totalAmount: 1600,
    operator: 'Mohamed Ali',
    depositId: 'DEP-WW-001',
    depositDate: '2024-12-15',
    isDeposited: true,
    notes: 'Normal day'
  },
  {
    id: '2',
    date: '2024-12-14',
    bucketsSold: 285,
    unitPrice: 5,
    totalAmount: 1425,
    operator: 'Hassan Ibrahim',
    depositId: 'DEP-WW-002',
    depositDate: '2024-12-14',
    isDeposited: true
  },
  {
    id: '3',
    date: '2024-12-13',
    bucketsSold: 310,
    unitPrice: 5,
    totalAmount: 1550,
    operator: 'Mohamed Ali',
    depositId: 'DEP-WW-003',
    depositDate: '2024-12-13',
    isDeposited: true
  },
  {
    id: '4',
    date: '2024-12-12',
    bucketsSold: 290,
    unitPrice: 5,
    totalAmount: 1450,
    operator: 'Hassan Ibrahim',
    isDeposited: false,
    notes: 'Pending deposit'
  },
  {
    id: '5',
    date: '2024-12-11',
    bucketsSold: 300,
    unitPrice: 5,
    totalAmount: 1500,
    operator: 'Mohamed Ali',
    depositId: 'DEP-WW-004',
    depositDate: '2024-12-11',
    isDeposited: true
  }
]

// User Module Mock Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@kalaexcel.com',
    phone: '+255-123-456-789',
    role: 'admin',
    status: 'active',
    dateCreated: '2024-01-01',
    lastLogin: '2024-12-15'
  },
  {
    id: '2',
    name: 'John Manager',
    email: 'john@kalaexcel.com',
    phone: '+255-123-456-790',
    role: 'manager',
    status: 'active',
    dateCreated: '2024-02-01',
    lastLogin: '2024-12-14'
  },
  {
    id: '3',
    name: 'Jane Operator',
    email: 'jane@kalaexcel.com',
    phone: '+255-123-456-791',
    role: 'operator',
    status: 'active',
    dateCreated: '2024-03-01',
    lastLogin: '2024-12-15'
  },
  {
    id: '4',
    name: 'Mike Cashier',
    email: 'mike@kalaexcel.com',
    phone: '+255-123-456-792',
    role: 'cashier',
    status: 'active',
    dateCreated: '2024-04-01',
    lastLogin: '2024-12-13'
  }
]

// Settings Module Mock Data
export const mockPropertyTypes: PropertyType[] = [
  {
    id: '1',
    name: 'Retail Shop',
    description: 'Commercial retail space',
    dateCreated: '2024-01-01'
  },
  {
    id: '2',
    name: 'Office Space',
    description: 'Commercial office space',
    dateCreated: '2024-01-01'
  },
  {
    id: '3',
    name: 'Warehouse',
    description: 'Storage and warehouse facility',
    dateCreated: '2024-01-01'
  },
  {
    id: '4',
    name: 'Restaurant',
    description: 'Food service establishment',
    dateCreated: '2024-01-01'
  }
]

export const mockBusinessTypes: BusinessType[] = [
  {
    id: '1',
    name: 'Electronics Store',
    description: 'Electronics and gadgets retail',
    dateCreated: '2024-01-01'
  },
  {
    id: '2',
    name: 'Clothing Boutique',
    description: 'Fashion and clothing retail',
    dateCreated: '2024-01-01'
  },
  {
    id: '3',
    name: 'Restaurant',
    description: 'Food and beverage service',
    dateCreated: '2024-01-01'
  },
  {
    id: '4',
    name: 'Supermarket',
    description: 'Grocery and general merchandise',
    dateCreated: '2024-01-01'
  },
  {
    id: '5',
    name: 'Pharmacy',
    description: 'Pharmaceutical retail',
    dateCreated: '2024-01-01'
  }
]

export const mockTransactionCategories: TransactionCategory[] = [
  {
    id: '1',
    name: 'Rent Income',
    type: 'income',
    description: 'Rental payments from tenants',
    dateCreated: '2024-01-01'
  },
  {
    id: '2',
    name: 'Water Supply Income',
    type: 'income',
    description: 'Water supply subscription payments',
    dateCreated: '2024-01-01'
  },
  {
    id: '3',
    name: 'Toilet Collection',
    type: 'income',
    description: 'Public toilet daily collections',
    dateCreated: '2024-01-01'
  },
  {
    id: '4',
    name: 'Water Well Collection',
    type: 'income',
    description: 'Water well daily collections',
    dateCreated: '2024-01-01'
  },
  {
    id: '5',
    name: 'Construction',
    type: 'expense',
    description: 'Construction project expenses',
    dateCreated: '2024-01-01'
  },
  {
    id: '6',
    name: 'Maintenance',
    type: 'expense',
    description: 'Property maintenance costs',
    dateCreated: '2024-01-01'
  },
  {
    id: '7',
    name: 'Utilities',
    type: 'expense',
    description: 'Utility bills and services',
    dateCreated: '2024-01-01'
  },
  {
    id: '8',
    name: 'Salaries',
    type: 'expense',
    description: 'Employee salaries and wages',
    dateCreated: '2024-01-01'
  }
]

export const mockConstructionMaterials: ConstructionMaterial[] = [
  {
    id: '1',
    name: 'Cement',
    unit: 'bags',
    description: 'Portland cement for construction',
    dateCreated: '2024-01-01'
  },
  {
    id: '2',
    name: 'Steel Bars',
    unit: 'kg',
    description: 'Reinforcement steel bars',
    dateCreated: '2024-01-01'
  },
  {
    id: '3',
    name: 'Sand',
    unit: 'cubic meters',
    description: 'Construction sand',
    dateCreated: '2024-01-01'
  },
  {
    id: '4',
    name: 'Gravel',
    unit: 'cubic meters',
    description: 'Construction gravel/aggregate',
    dateCreated: '2024-01-01'
  },
  {
    id: '5',
    name: 'Bricks',
    unit: 'pieces',
    description: 'Construction bricks',
    dateCreated: '2024-01-01'
  },
  {
    id: '6',
    name: 'Paint',
    unit: 'liters',
    description: 'Wall and surface paint',
    dateCreated: '2024-01-01'
  },
  {
    id: '7',
    name: 'Electrical Wire',
    unit: 'meters',
    description: 'Electrical wiring cables',
    dateCreated: '2024-01-01'
  },
  {
    id: '8',
    name: 'PVC Pipes',
    unit: 'meters',
    description: 'Plumbing PVC pipes',
    dateCreated: '2024-01-01'
  }
]

export const mockProfile: Profile = {
  id: '1',
  companyName: 'Kala Excel Co., Ltd',
  email: 'info@kalaexcel.com',
  phone: '+255-123-456-789',
  address: 'Dar es Salaam, Tanzania',
  taxId: 'TIN-123456789',
  registrationNumber: 'REG-2024-001'
}