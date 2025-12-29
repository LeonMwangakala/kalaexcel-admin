import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchCustomers, fetchReadings } from './waterSupplySlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Button } from '../../components/common/Button'
import { Pagination } from '../../components/common/Pagination'
import { Edit, Trash2, Plus, FileText } from 'lucide-react'
import { IoWaterOutline } from 'react-icons/io5'
import { format } from 'date-fns'

export default function WaterSupplyCustomerList() {
  const dispatch = useDispatch<AppDispatch>()
  const { customers, readings, loading, customersPagination } = useSelector((state: RootState) => state.waterSupply)
  const payments = useSelector((state: RootState) => state.waterSupply.payments)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    dispatch(fetchCustomers({ page: currentPage, perPage: itemsPerPage }))
    dispatch(fetchReadings({}))
  }, [dispatch, currentPage, itemsPerPage])

  const getCustomerStats = (customerId: string) => {
    const customerReadings = readings.filter(r => r.customerId === customerId)
    const pendingBills = customerReadings.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue')
    const totalPending = pendingBills.reduce((sum, r) => {
      const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    return { totalReadings: customerReadings.length, pendingBills: pendingBills.length, totalPending }
  }

  const columns = [
    {
      key: 'name',
      title: 'Customer Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <IoWaterOutline className="h-5 w-5 text-primary-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      ),
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      ),
    },
    {
      key: 'meterNumber',
      title: 'Meter Number',
      render: (value: string) => (
        <span className="font-mono text-gray-900">{value}</span>
      ),
    },
    {
      key: 'unitPrice',
      title: 'Unit Price',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="text-gray-900">TZS {isNaN(numValue) ? '0.00' : numValue.toFixed(2)}</span>
        )
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'stats',
      title: 'Pending Bills',
      render: (_: any, record: any) => {
        const stats = getCustomerStats(record.id)
        return (
          <div>
            <span className="text-sm font-medium text-warning-600">
              {stats.pendingBills} bills (TZS {stats.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/water-supply/customers/${record.id}/readings`}>
            <Button size="sm" variant="secondary" icon={<FileText className="h-4 w-4" />}>
              Readings
            </Button>
          </Link>
          <Link to={`/water-supply/customers/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="danger" 
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              console.log('Delete customer:', record.id)
            }}
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  // For pending bills calculation, we need all readings, so fetch them without pagination
  const totalPendingBills = readings.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue')
  const totalPendingAmount = totalPendingBills.reduce((sum, r) => {
    const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  
  // Calculate total revenue from paid bills
  const paidReadings = readings.filter(r => r.paymentStatus === 'paid')
  const totalRevenue = paidReadings.reduce((sum, r) => {
    const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  
  // Get total customers from pagination if available, otherwise use current customers length
  const totalCustomers = customersPagination?.totalItems || customers.length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Water Supply Customers</h1>
          <p className="text-gray-600 mt-1">Manage water supply subscriptions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/water-supply/readings">
            <Button variant="secondary" icon={<FileText className="h-4 w-4" />}>
              View Readings
            </Button>
          </Link>
          <Link to="/water-supply/customers/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            <p className="text-sm text-gray-600">Total Customers</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              TZS {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">
              TZS {totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">Total Pending Bills</p>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card title="Customers List" subtitle="All water supply customers">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={customers}
              emptyMessage="No customers registered. Add your first customer to get started."
              showSerialNumber={true}
              serialNumberStart={customersPagination ? (currentPage - 1) * itemsPerPage + 1 : 1}
            />
            {customersPagination && (
              <div className="mt-4">
                <Pagination
                  currentPage={customersPagination.currentPage}
                  totalPages={customersPagination.totalPages}
                  totalItems={customersPagination.totalItems}
                  itemsPerPage={customersPagination.itemsPerPage}
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

