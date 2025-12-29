import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Button } from '../../components/common/Button'
import { Pagination } from '../../components/common/Pagination'
import { fetchReadings, fetchCustomers } from './waterSupplySlice'
import { Edit, Trash2, Plus } from 'lucide-react'
import { IoWaterOutline } from 'react-icons/io5'
import { GiMoneyStack } from 'react-icons/gi'
import { format } from 'date-fns'

export default function WaterSupplyReadingList() {
  const dispatch = useDispatch<AppDispatch>()
  const { readings, loading, readingsPagination } = useSelector((state: RootState) => state.waterSupply)
  const customers = useSelector((state: RootState) => state.waterSupply.customers)
  const payments = useSelector((state: RootState) => state.waterSupply.payments)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    // Fetch all customers for customer name lookup (using large perPage to get all)
    dispatch(fetchCustomers({ page: 1, perPage: 1000 }))
    dispatch(fetchReadings({ page: currentPage, perPage: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const getCustomerName = (customerId: string, record?: any) => {
    // First try to find customer in Redux state
    let customer = customers.find(c => c.id === customerId)
    // If not found, try to use nested customer data from the reading
    if (!customer && record?.customer) {
      customer = record.customer
    }
    return customer?.name || 'Unknown Customer'
  }

  const getCustomerUnitPrice = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.unitPrice || 0
  }

  const columns = [
    {
      key: 'customerId',
      title: 'Customer',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <IoWaterOutline className="h-5 w-5 text-primary-400 mr-2" />
          <span className="font-medium">{getCustomerName(value, record)}</span>
        </div>
      ),
    },
    {
      key: 'readingDate',
      title: 'Reading Date',
      render: (value: string) => (
        <span className="text-gray-900">{format(new Date(value), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      key: 'meterReading',
      title: 'Meter Reading',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="font-mono text-gray-900">{isNaN(numValue) ? '0' : numValue.toLocaleString()}</span>
        )
      },
    },
    {
      key: 'unitsConsumed',
      title: 'Units Consumed',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="text-gray-900">{isNaN(numValue) ? '0' : numValue.toLocaleString()}</span>
        )
      },
    },
    {
      key: 'amountDue',
      title: 'Amount Due',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="font-medium text-gray-900">
            TZS {isNaN(numValue) ? '0.00' : numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      key: 'paymentStatus',
      title: 'Payment Status',
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
      key: 'paymentDate',
      title: 'Payment Date',
      render: (value: string | undefined) => (
        <span className="text-gray-900">{value ? format(new Date(value), 'MMM dd, yyyy') : '-'}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          {record.paymentStatus !== 'paid' && (
            <Link to={`/water-supply/readings/${record.id}/payment`}>
              <Button size="sm" variant="success" icon={<GiMoneyStack className="h-4 w-4" />}>
                Record Payment
              </Button>
            </Link>
          )}
          <Link to={`/water-supply/readings/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="danger" 
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              console.log('Delete reading:', record.id)
            }}
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  const currentMonth = format(new Date(), 'yyyy-MM')
  const monthlyReadings = readings.filter(r => r.month === currentMonth)
  const monthlyRevenue = monthlyReadings
    .filter(r => r.paymentStatus === 'paid')
    .reduce((sum, r) => {
      const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  const pendingBills = readings.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue')
  const totalPending = pendingBills.reduce((sum, r) => {
    const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalUnitsConsumed = monthlyReadings.reduce((sum, r) => {
    const units = typeof r.unitsConsumed === 'number' ? r.unitsConsumed : parseFloat(String(r.unitsConsumed || 0))
    return sum + (isNaN(units) ? 0 : units)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Water Supply Readings</h1>
          <p className="text-gray-600 mt-1">Manage meter readings and billing</p>
        </div>
        <Link to="/water-supply/readings/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Record Reading
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{readings.length}</p>
            <p className="text-sm text-gray-600">Total Readings</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              TZS {monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">
              TZS {totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">Pending Bills</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{totalUnitsConsumed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Units Consumed (This Month)</p>
          </div>
        </Card>
      </div>

      {/* Readings Table */}
      <Card title="Meter Readings" subtitle="All reading records">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading readings...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={readings}
              emptyMessage="No readings recorded. Record your first reading to get started."
              showSerialNumber={true}
              serialNumberStart={readingsPagination ? (currentPage - 1) * itemsPerPage + 1 : 1}
            />
            {readingsPagination && (
              <div className="mt-4">
                <Pagination
                  currentPage={readingsPagination.currentPage}
                  totalPages={readingsPagination.totalPages}
                  totalItems={readingsPagination.totalItems}
                  itemsPerPage={readingsPagination.itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

