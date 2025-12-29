import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchContracts } from '../contracts/contractsSlice'
import { fetchRentPayments } from './rentSlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { Edit, Trash2, Plus } from 'lucide-react'
import { GiMoneyStack } from 'react-icons/gi'
import { format } from 'date-fns'

export default function RentList() {
  const dispatch = useDispatch<AppDispatch>()
  const { payments, pagination, loading } = useSelector((state: RootState) => state.rent)
  const tenants = useSelector((state: RootState) => state.tenants.tenants)
  const contracts = useSelector((state: RootState) => state.contracts.contracts)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    dispatch(fetchRentPayments({ page: currentPage, perPage: itemsPerPage }))
    dispatch(fetchContracts())
    dispatch(fetchTenants())
  }, [dispatch, currentPage, itemsPerPage])

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown Tenant'
  }

  const getContractNumber = (contractId?: string) => {
    if (!contractId) return 'N/A'
    const contract = contracts.find(c => c.id === contractId)
    return contract?.contractNumber || 'N/A'
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const columns = [
    {
      key: 'tenantId',
      title: 'Tenant',
      render: (value: string) => (
        <div className="flex items-center">
          <GiMoneyStack className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{getTenantName(value)}</span>
        </div>
      ),
    },
    {
      key: 'contractId',
      title: 'Contract',
      render: (value: string, record: any) => (
        <span className="font-mono text-sm text-primary-600">
          {getContractNumber(record.contractId)}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => (
        <span className="font-medium text-gray-900">TZS {value.toLocaleString()}</span>
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
        <span className="text-gray-900 capitalize">{value.replace('_', ' ')}</span>
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
          <Link to={`/rent/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="danger" 
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              // Handle delete logic here
              console.log('Delete payment:', record.id)
            }}
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  const paidPayments = payments.filter(p => p.status === 'paid')
  const pendingPayments = payments.filter(p => p.status === 'pending')
  const overduePayments = payments.filter(p => p.status === 'overdue')
  const totalReceived = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.reduce((sum, p) => sum + (p.status !== 'paid' ? p.amount : 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rent Payments</h1>
          <p className="text-gray-600 mt-1">Track rent payments and collections</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/rent/pending">
            <Button variant="warning" icon={<GiMoneyStack className="h-4 w-4" />}>
              View Pending
            </Button>
          </Link>
          <Link to="/rent/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              Record Payment
            </Button>
          </Link>
        </div>
      </div>

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
            <p className="text-2xl font-bold text-success-600">TZS {totalReceived.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Received</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">TZS {totalPending.toLocaleString()}</p>
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

      {/* Payments Table */}
      <Card title="Rent Payments" subtitle="All payment records">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={payments}
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
    </div>
  )
}