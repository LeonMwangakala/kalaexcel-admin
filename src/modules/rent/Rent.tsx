import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchContracts } from '../contracts/contractsSlice'
import { fetchRentPayments } from './rentSlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { fetchProperties } from '../property/propertySlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { Edit, Trash2, Plus, AlertTriangle, Calendar, Mail, CheckCircle, FileText } from 'lucide-react'
import { GiMoneyStack } from 'react-icons/gi'
import { format } from 'date-fns'

type RentTab = 'all' | 'pending'

export default function Rent() {
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const { payments, pagination, loading } = useSelector((state: RootState) => state.rent)
  const tenants = useSelector((state: RootState) => state.tenants.tenants)
  const contracts = useSelector((state: RootState) => state.contracts.contracts)
  const properties = useSelector((state: RootState) => state.properties.properties)
  
  const [activeTab, setActiveTab] = useState<RentTab>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Set active tab based on URL hash or default to 'all'
  useEffect(() => {
    if (location.hash === '#pending') {
      setActiveTab('pending')
    } else {
      setActiveTab('all')
    }
  }, [location.hash])

  useEffect(() => {
    dispatch(fetchRentPayments({ page: currentPage, perPage: itemsPerPage }))
    // Tenant, contract, and property data are nested in payment response, but fetch for fallback
    dispatch(fetchContracts({ page: 1, perPage: 1000 }))
    dispatch(fetchTenants({}))
    dispatch(fetchProperties({ page: 1, perPage: 1000 }))
  }, [dispatch, currentPage, itemsPerPage])

  const getTenantName = (tenantId: string, payment?: any) => {
    // First try to get from payment's nested tenant object (from API)
    if (payment?.tenant?.name) {
      return payment.tenant.name
    }
    // Fallback to Redux state
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown Tenant'
  }

  const getTenantPhone = (tenantId: string, payment?: any) => {
    if (payment?.tenant?.phone) {
      return payment.tenant.phone
    }
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.phone || 'No phone'
  }

  const getContractNumber = (contractId?: string, payment?: any) => {
    if (!contractId) return 'N/A'
    // First try to get from payment's nested contract object (from API)
    if (payment?.contract?.contract_number) {
      return payment.contract.contract_number
    }
    if (payment?.contract?.contractNumber) {
      return payment.contract.contractNumber
    }
    // Fallback to Redux state
    const contract = contracts.find(c => c.id === contractId)
    return contract?.contractNumber || 'N/A'
  }

  const getPropertyName = (contractId?: string, payment?: any) => {
    if (!contractId) return 'N/A'
    // First try to get from payment's nested contract object (from API)
    if (payment?.contract?.property?.name) {
      return payment.contract.property.name
    }
    // Fallback to Redux state
    const contract = contracts.find(c => c.id === contractId)
    if (contract) {
      const property = properties.find(p => p.id === contract.propertyId)
      return property?.name || 'Unknown Property'
    }
    return 'N/A'
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Filter payments based on active tab
  const filteredPayments = activeTab === 'pending' 
    ? payments.filter(p => p.status === 'pending' || p.status === 'overdue')
    : payments

  const paidPayments = payments.filter(p => p.status === 'paid')
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue')
  const overduePayments = payments.filter(p => p.status === 'overdue')
  const totalReceived = paidPayments.reduce((sum, p) => {
    const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalPending = pendingPayments.reduce((sum, p) => {
    const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Columns for All Payments tab
  const allPaymentsColumns = [
    {
      key: 'tenantId',
      title: 'Tenant',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <GiMoneyStack className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{getTenantName(value, record)}</span>
        </div>
      ),
    },
    {
      key: 'contractId',
      title: 'Contract',
      render: (value: string, record: any) => (
        <span className="font-mono text-sm text-primary-600">
          {getContractNumber(record.contractId, record)}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => (
        <span className="font-medium text-gray-900">TZS {Number(value).toLocaleString('en-US')}</span>
      ),
    },
    {
      key: 'month',
      title: 'Month',
      render: (value: string) => {
        const [year, month] = value.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return format(date, 'MMMM yyyy')
      },
    },
    {
      key: 'paymentDate',
      title: 'Payment Date',
      render: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy') : 'Not paid',
    },
    {
      key: 'paymentMethod',
      title: 'Method',
      render: (value: string) => (
        <span className="text-gray-900 capitalize">{value?.replace('_', ' ') || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'paid' ? 'bg-success-100 text-success-800' :
          value === 'pending' ? 'bg-warning-100 text-warning-800' :
          'bg-danger-100 text-danger-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          {record.status === 'paid' && (
            <Button 
              size="sm" 
              variant="secondary" 
              icon={<FileText className="h-4 w-4" />}
              onClick={() => {
                // Handle receipt generation/viewing
                console.log('Generate receipt for payment:', record.id)
                // TODO: Implement receipt functionality
              }}
            >
              Receipt
            </Button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ]

  // Columns for Pending Payments tab
  const pendingPaymentsColumns = [
    {
      key: 'tenantId',
      title: 'Tenant',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">{getTenantName(value, record)}</p>
            <p className="text-sm text-gray-600">{getTenantPhone(value, record)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      title: 'Property',
      render: (_: any, record: any) => (
        <span className="text-gray-900">{getPropertyName(record.contractId, record)}</span>
      ),
    },
    {
      key: 'contractId',
      title: 'Contract',
      render: (value: string, record: any) => (
        <span className="font-mono text-sm text-primary-600">
          {getContractNumber(record.contractId, record)}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount Due',
      render: (value: number) => (
        <span className="font-bold text-danger-600">TZS {Number(value).toLocaleString('en-US')}</span>
      ),
    },
    {
      key: 'month',
      title: 'Month',
      render: (value: string) => {
        const [year, month] = value.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return format(date, 'MMMM yyyy')
      },
    },
    {
      key: 'paymentDate',
      title: 'Due Date',
      render: (value: string, record: any) => {
        // Calculate due date (assume payment due on 1st of month)
        const [year, month] = record.month.split('-')
        const dueDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        return format(dueDate, 'MMM dd, yyyy')
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'overdue' ? 'bg-danger-100 text-danger-800' : 'bg-warning-100 text-warning-800'
        }`}>
          {value === 'overdue' ? 'Overdue' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/rent/${record.id}/edit`}>
            <Button 
              size="sm" 
              variant="success"
              icon={<CheckCircle className="h-4 w-4" />}
            >
              Record Payment
            </Button>
          </Link>
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rent Payments</h1>
          <p className="text-gray-600 mt-1">Track rent payments and collections</p>
        </div>
        <Link to="/rent/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              All Payments
              {payments.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {payments.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Pending
              {pendingPayments.length > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  overduePayments.length > 0 
                    ? 'bg-danger-100 text-danger-600' 
                    : 'bg-warning-100 text-warning-600'
                }`}>
                  {pendingPayments.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Alert Banner for Pending Tab */}
      {activeTab === 'pending' && overduePayments.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-danger-600 mr-2" />
            <p className="text-danger-800 font-medium">
              You have {overduePayments.length} overdue payment{overduePayments.length > 1 ? 's' : ''} 
              totaling TZS {overduePayments.reduce((sum, p) => {
                const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount || 0))
                return sum + (isNaN(amount) ? 0 : amount)
              }, 0).toLocaleString('en-US')}. Action required.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</p>
            <p className="text-sm text-gray-600">Total Payments</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">TZS {Number(totalReceived).toLocaleString('en-US')}</p>
            <p className="text-sm text-gray-600">Total Received</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">TZS {Number(totalPending).toLocaleString('en-US')}</p>
            <p className="text-sm text-gray-600">Total Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-600">{overduePayments.length}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </Card>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'all' ? (
        <Card title="All Rent Payments" subtitle="Complete payment history">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : (
            <>
              <Table
                columns={allPaymentsColumns}
                data={filteredPayments}
                emptyMessage="No payments recorded. Record your first payment to get started."
                showSerialNumber
                serialNumberStart={pagination ? (pagination.currentPage - 1) * pagination.perPage + 1 : 1}
              />
              {pagination && pagination.total > 0 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.lastPage}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.perPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}
        </Card>
      ) : (
        <Card title="Pending & Overdue Payments" subtitle="Payments requiring attention">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <GiMoneyStack className="h-12 w-12 text-success-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending or overdue payments at this time.</p>
            </div>
          ) : (
            <>
              <Table
                columns={pendingPaymentsColumns}
                data={filteredPayments}
                emptyMessage="No pending payments found."
                showSerialNumber
              />
            </>
          )}
        </Card>
      )}
    </div>
  )
}

