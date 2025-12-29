import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { fetchReadings, fetchCustomerById } from './waterSupplySlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Button } from '../../components/common/Button'
import { Pagination } from '../../components/common/Pagination'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import { IoWaterOutline } from 'react-icons/io5'
import { GiMoneyStack } from 'react-icons/gi'
import { format } from 'date-fns'

export default function WaterSupplyCustomerReadings() {
  const { id } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { customers, readings, loading, readingsPagination } = useSelector((state: RootState) => state.waterSupply)
  
  const customer = customers.find(c => c.id === id)
  const customerReadings = readings.filter(r => r.customerId === id)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id))
      dispatch(fetchReadings({ customerId: id, page: currentPage, perPage: itemsPerPage }))
    }
  }, [id, dispatch, currentPage, itemsPerPage])

  const columns = [
    {
      key: 'readingDate',
      title: 'Reading Date',
      render: (value: string) => (
        <span className="text-gray-900">{format(new Date(value), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      key: 'month',
      title: 'Month',
      render: (value: string) => (
        <span className="text-gray-900">{format(new Date(value + '-01'), 'MMM yyyy')}</span>
      ),
    },
    {
      key: 'previousReading',
      title: 'Previous Reading',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="font-mono text-gray-900">{isNaN(numValue) ? '0' : numValue.toLocaleString()}</span>
        )
      },
    },
    {
      key: 'meterReading',
      title: 'Current Reading',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="font-mono text-gray-900 font-medium">{isNaN(numValue) ? '0' : numValue.toLocaleString()}</span>
        )
      },
    },
    {
      key: 'unitsConsumed',
      title: 'Units Consumed',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return (
          <span className="text-gray-900 font-medium">{isNaN(numValue) ? '0' : numValue.toLocaleString()}</span>
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

  const paidReadings = customerReadings.filter(r => r.paymentStatus === 'paid')
  const pendingReadings = customerReadings.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue')
  const totalPaid = paidReadings.reduce((sum, r) => {
    const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalPending = pendingReadings.reduce((sum, r) => {
    const amount = typeof r.amountDue === 'number' ? r.amountDue : parseFloat(String(r.amountDue || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalUnits = customerReadings.reduce((sum, r) => {
    const units = typeof r.unitsConsumed === 'number' ? r.unitsConsumed : parseFloat(String(r.unitsConsumed || 0))
    return sum + (isNaN(units) ? 0 : units)
  }, 0)

  if (!customer && loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link to="/water-supply/customers">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Customers
          </Button>
        </Link>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">Customer not found</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/water-supply/customers">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Customers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {customer.name} - Meter Readings
          </h1>
          <p className="text-gray-600 mt-1">
            Meter: {customer.meterNumber} | Location: {customer.location}
          </p>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Customer Name</p>
            <p className="font-medium text-gray-900">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium text-gray-900">{customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Meter Number</p>
            <p className="font-medium text-gray-900 font-mono">{customer.meterNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unit Price</p>
            <p className="font-medium text-gray-900">
              TZS {typeof customer.unitPrice === 'number' ? customer.unitPrice.toFixed(2) : parseFloat(String(customer.unitPrice || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{customerReadings.length}</p>
            <p className="text-sm text-gray-600">Total Readings</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              TZS {totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600">Total Paid</p>
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
            <p className="text-2xl font-bold text-primary-600">{totalUnits.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Units Consumed</p>
          </div>
        </Card>
      </div>

      {/* Readings Table */}
      <Card 
        title="Meter Readings" 
        subtitle={`All readings for ${customer.name}`}
        actions={
          <Link to={`/water-supply/readings/new?customerId=${id}`}>
            <Button size="sm" icon={<Plus className="h-4 w-4" />}>
              Record Reading
            </Button>
          </Link>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading readings...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={customerReadings}
              emptyMessage="No readings recorded for this customer. Record your first reading to get started."
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

