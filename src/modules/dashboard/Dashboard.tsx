import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { Card, StatCard } from '../../components/common/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Building2, Users, AlertTriangle, HardHat, CreditCard, TrendingUp, Calendar } from 'lucide-react'
import { GiMoneyStack } from 'react-icons/gi'
import { IoWaterOutline } from 'react-icons/io5'
import { GiTap } from 'react-icons/gi'
import { PiToilet } from 'react-icons/pi'
import { format } from 'date-fns'
import { fetchProperties } from '../property/propertySlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { fetchContracts } from '../contracts/contractsSlice'
import { fetchRentPayments } from '../rent/rentSlice'
import { fetchAccounts } from '../banking/bankingSlice'
import { fetchProjects, fetchExpenses } from '../construction/constructionSlice'
import { fetchCollections as fetchToiletCollections } from '../toilet/toiletSlice'
import { fetchReadings as fetchWaterSupplyReadings } from '../waterSupply/waterSupplySlice'
import { fetchCollections as fetchWaterWellCollections } from '../waterWell/waterWellSlice'

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const properties = useSelector((state: RootState) => state.properties.properties)
  const tenants = useSelector((state: RootState) => state.tenants.tenants)
  const contracts = useSelector((state: RootState) => state.contracts.contracts)
  const payments = useSelector((state: RootState) => state.rent.payments)
  const accounts = useSelector((state: RootState) => state.banking.accounts)
  const projects = useSelector((state: RootState) => state.construction.projects)
  const expenses = useSelector((state: RootState) => state.construction.expenses)
  const toiletCollections = useSelector((state: RootState) => state.toilet.collections)
  const waterSupplyReadings = useSelector((state: RootState) => state.waterSupply.readings)
  const waterWellCollections = useSelector((state: RootState) => state.waterWell.collections)

  // Fetch all data from API on component mount
  useEffect(() => {
    // Fetch all data with large perPage to get all records for dashboard calculations
    dispatch(fetchProperties({ page: 1, perPage: 1000 }))
    dispatch(fetchTenants({ page: 1, perPage: 1000 }))
    dispatch(fetchContracts({ page: 1, perPage: 1000 })) // Fetch contracts to determine property status
    dispatch(fetchRentPayments({ page: 1, perPage: 1000 }))
    dispatch(fetchAccounts())
    dispatch(fetchProjects({ page: 1, perPage: 1000 }))
    dispatch(fetchExpenses({ page: 1, perPage: 1000 })) // Fetch all expenses (no projectId)
    dispatch(fetchToiletCollections({ page: 1, perPage: 1000 }))
    dispatch(fetchWaterSupplyReadings({ page: 1, perPage: 1000 }))
    dispatch(fetchWaterWellCollections({ page: 1, perPage: 1000 }))
  }, [dispatch])

  // Calculate metrics
  const totalProperties = properties.length
  
  // Calculate occupied properties based on active contracts
  const today = new Date().toISOString().split('T')[0]
  const occupiedPropertyIds = new Set(
    contracts
      .filter(c => c.status === 'active' && c.endDate >= today)
      .map(c => c.propertyId)
  )
  const occupiedProperties = properties.filter(p => occupiedPropertyIds.has(p.id)).length
  const vacantProperties = totalProperties - occupiedProperties
  
  const totalRent = properties.reduce((sum, p) => {
    const rent = typeof p.monthlyRent === 'number' ? p.monthlyRent : parseFloat(String(p.monthlyRent || 0))
    return sum + (isNaN(rent) ? 0 : rent)
  }, 0)
  
  const currentMonth = format(new Date(), 'yyyy-MM')
  const currentMonthPayments = payments.filter(p => p.month === currentMonth)
  const rentReceived = currentMonthPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => {
      const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const rentPending = totalRent - rentReceived
  const overduePayments = payments.filter(p => p.status === 'overdue').length

  const totalBankBalance = accounts.reduce((sum, a) => {
    const balance = typeof a.openingBalance === 'number' ? a.openingBalance : parseFloat(String(a.openingBalance || 0))
    return sum + (isNaN(balance) ? 0 : balance)
  }, 0)
  const constructionExpenses = expenses.reduce((sum, e) => {
    const amount = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Public Toilet metrics
  const todayToiletCollection = toiletCollections.find(c => c.date === today)
  const toiletTodayAmount = typeof todayToiletCollection?.amountCollected === 'number' 
    ? todayToiletCollection.amountCollected 
    : parseFloat(String(todayToiletCollection?.amountCollected || 0))
  const toiletMonthlyTotal = toiletCollections
    .filter(c => c.date && c.date.startsWith(currentMonth))
    .reduce((sum, c) => {
      const amount = typeof c.amountCollected === 'number' ? c.amountCollected : parseFloat(String(c.amountCollected || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const toiletDeposited = toiletCollections
    .filter(c => c.isDeposited)
    .reduce((sum, c) => {
      const amount = typeof c.amountCollected === 'number' ? c.amountCollected : parseFloat(String(c.amountCollected || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const toiletCollected = toiletCollections.reduce((sum, c) => {
    const amount = typeof c.amountCollected === 'number' ? c.amountCollected : parseFloat(String(c.amountCollected || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Water Supply metrics
  const waterSupplyMonthlyRevenue = waterSupplyReadings
    .filter(r => {
      const readingDate = r.readingDate ? new Date(r.readingDate).toISOString().substring(0, 7) : ''
      return readingDate === currentMonth && r.paymentStatus === 'paid'
    })
    .reduce((sum, r) => {
      const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const waterSupplyPendingBills = waterSupplyReadings
    .filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue')
    .reduce((sum, r) => {
      const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const waterSupplyUnitsConsumed = waterSupplyReadings
    .filter(r => {
      const readingDate = r.readingDate ? new Date(r.readingDate).toISOString().substring(0, 7) : ''
      return readingDate === currentMonth
    })
    .reduce((sum, r) => {
      const units = typeof r.unitsConsumed === 'number' ? r.unitsConsumed : parseFloat(String(r.unitsConsumed || 0))
      return sum + (isNaN(units) ? 0 : units)
    }, 0)

  // Water Well metrics
  const todayWaterWellCollection = waterWellCollections.find(c => c.date === today)
  const waterWellTodayAmount = typeof todayWaterWellCollection?.totalAmount === 'number'
    ? todayWaterWellCollection.totalAmount
    : parseFloat(String(todayWaterWellCollection?.totalAmount || 0))
  const waterWellMonthlyTotal = waterWellCollections
    .filter(c => c.date && c.date.startsWith(currentMonth))
    .reduce((sum, c) => {
      const amount = typeof c.totalAmount === 'number' ? c.totalAmount : parseFloat(String(c.totalAmount || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const waterWellDeposited = waterWellCollections
    .filter(c => c.isDeposited)
    .reduce((sum, c) => {
      const amount = typeof c.totalAmount === 'number' ? c.totalAmount : parseFloat(String(c.totalAmount || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const waterWellCollected = waterWellCollections.reduce((sum, c) => {
    const amount = typeof c.totalAmount === 'number' ? c.totalAmount : parseFloat(String(c.totalAmount || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Combined metrics
  const totalNewBusinessRevenue = toiletMonthlyTotal + waterSupplyMonthlyRevenue + waterWellMonthlyTotal
  const totalPendingCollections = (toiletCollected - toiletDeposited) + waterSupplyPendingBills + (waterWellCollected - waterWellDeposited)
  const totalDeposits = toiletDeposited + waterWellDeposited

  // Chart data
  const rentCollectionData = [
    { month: 'Aug', expected: 9000, received: 8500 },
    { month: 'Sep', expected: 9500, received: 9200 },
    { month: 'Oct', expected: 9500, received: 9500 },
    { month: 'Nov', expected: 10000, received: 9500 },
    { month: 'Dec', expected: 10000, received: rentReceived },
  ]

  const propertyStatusData = [
    { name: 'Occupied', value: occupiedProperties, color: '#22c55e' },
    { name: 'Vacant', value: vacantProperties, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your real estate portfolio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          subtitle={`${occupiedProperties} occupied, ${vacantProperties} vacant`}
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          title="Monthly Rent Expected"
          value={`TZS ${totalRent.toLocaleString()}`}
          subtitle="From all properties"
          icon={<GiMoneyStack className="h-6 w-6" />}
        />
        <StatCard
          title="Rent Received"
          value={`TZS ${rentReceived.toLocaleString()}`}
          subtitle={`${rentPending > 0 ? `TZS ${rentPending} pending` : 'All paid'}`}
          trend={{ value: 5, isPositive: true }}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Total Bank Balance"
          value={`TZS ${totalBankBalance.toLocaleString()}`}
          subtitle="Across all accounts"
          icon={<CreditCard className="h-6 w-6" />}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Tenants"
          value={tenants.length}
          subtitle="Currently renting"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Overdue Payments"
          value={overduePayments}
          subtitle="Require attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatCard
          title="Construction Projects"
          value={projects.filter(p => p.status === 'in_progress').length}
          subtitle="Currently ongoing"
          icon={<HardHat className="h-6 w-6" />}
        />
        <StatCard
          title="Construction Expenses"
          value={`TZS ${constructionExpenses.toLocaleString()}`}
          subtitle="This month"
          icon={<Calendar className="h-6 w-6" />}
        />
      </div>

      {/* New Business Modules - Public Toilet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Toilet: Today's Collection"
          value={`TZS ${toiletTodayAmount.toLocaleString()}`}
          subtitle="Daily collection"
          icon={<PiToilet className="h-6 w-6" />}
        />
        <StatCard
          title="Toilet: Monthly Revenue"
          value={`TZS ${toiletMonthlyTotal.toLocaleString()}`}
          subtitle={`${toiletDeposited.toLocaleString()} deposited`}
          icon={<PiToilet className="h-6 w-6" />}
        />
        <StatCard
          title="Toilet: Deposited vs Collected"
          value={`TZS ${toiletDeposited.toLocaleString()}`}
          subtitle={`TZS ${(toiletCollected - toiletDeposited).toLocaleString()} pending`}
          icon={<PiToilet className="h-6 w-6" />}
        />
      </div>

      {/* Water Supply */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Water Supply: Monthly Revenue"
          value={`TZS ${waterSupplyMonthlyRevenue.toLocaleString()}`}
          subtitle="This month"
          icon={<IoWaterOutline className="h-6 w-6" />}
        />
        <StatCard
          title="Water Supply: Pending Bills"
          value={`TZS ${waterSupplyPendingBills.toLocaleString()}`}
          subtitle="Outstanding payments"
          icon={<IoWaterOutline className="h-6 w-6" />}
        />
        <StatCard
          title="Water Supply: Units Consumed"
          value={waterSupplyUnitsConsumed.toLocaleString()}
          subtitle="This month"
          icon={<IoWaterOutline className="h-6 w-6" />}
        />
      </div>

      {/* Water Well */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Water Well: Today's Collection"
          value={`TZS ${waterWellTodayAmount.toLocaleString()}`}
          subtitle="Daily collection"
          icon={<GiTap className="h-6 w-6" />}
        />
        <StatCard
          title="Water Well: Monthly Revenue"
          value={`TZS ${waterWellMonthlyTotal.toLocaleString()}`}
          subtitle={`${waterWellDeposited.toLocaleString()} deposited`}
          icon={<GiTap className="h-6 w-6" />}
        />
        <StatCard
          title="Water Well: Deposited vs Collected"
          value={`TZS ${waterWellDeposited.toLocaleString()}`}
          subtitle={`TZS ${(waterWellCollected - waterWellDeposited).toLocaleString()} pending`}
          icon={<GiTap className="h-6 w-6" />}
        />
      </div>

      {/* Combined Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total New Business Revenue"
          value={`TZS ${totalNewBusinessRevenue.toLocaleString()}`}
          subtitle="All three businesses this month"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Total Pending Collections"
          value={`TZS ${totalPendingCollections.toLocaleString()}`}
          subtitle="Requires attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatCard
          title="Total Deposits Made"
          value={`TZS ${totalDeposits.toLocaleString()}`}
          subtitle="Toilet & Water Well deposits"
          icon={<CreditCard className="h-6 w-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rent Collection Chart */}
        <Card title="Rent Collection Trend" subtitle="Monthly rent collection vs expected">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rentCollectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`TZS ${value.toLocaleString()}`, '']} />
              <Bar dataKey="expected" fill="#e5e7eb" name="Expected" />
              <Bar dataKey="received" fill="#0ea5e9" name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Property Status Pie Chart */}
        <Card title="Property Status" subtitle="Occupied vs vacant properties">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {propertyStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card title="Recent Rent Payments" subtitle="Latest payment activities">
          <div className="space-y-4">
            {currentMonthPayments.slice(0, 5).map((payment) => {
              const tenant = tenants.find(t => t.id === payment.tenantId)
              const paymentAmount = typeof payment.amount === 'number' ? payment.amount : parseFloat(String(payment.amount || 0))
              return (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{tenant?.name}</p>
                    <p className="text-sm text-gray-600">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">TZS {paymentAmount.toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'paid' ? 'bg-success-100 text-success-800' :
                      payment.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                      'bg-danger-100 text-danger-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Construction Progress */}
        <Card title="Construction Projects" subtitle="Project progress overview">
          <div className="space-y-4">
            {projects.filter(p => p.status === 'in_progress').map((project) => {
              // Calculate actual spent from expenses for this project
              const projectExpenses = expenses.filter(e => e.projectId === project.id)
              const actualSpent = projectExpenses.reduce((sum, e) => {
                const amount = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0))
                return sum + (isNaN(amount) ? 0 : amount)
              }, 0)
              
              const projectBudget = typeof project.budget === 'number' ? project.budget : parseFloat(String(project.budget || 0))
              const progressPercent = typeof project.progress === 'number' ? project.progress : parseFloat(String(project.progress || 0))
              
              return (
                <div key={project.id} className="py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className="text-sm text-gray-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    TZS {actualSpent.toLocaleString()} of TZS {projectBudget.toLocaleString()} spent
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}