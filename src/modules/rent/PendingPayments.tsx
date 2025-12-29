import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchRentPayments } from './rentSlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Button } from '../../components/common/Button'
import { AlertTriangle, Calendar, Mail } from 'lucide-react'
import { GiMoneyStack } from 'react-icons/gi'
import { format } from 'date-fns'

export default function PendingPayments() {
  const dispatch = useDispatch<AppDispatch>()
  const payments = useSelector((state: RootState) => state.rent.payments)
  const { loading } = useSelector((state: RootState) => state.rent)
  const tenants = useSelector((state: RootState) => state.tenants.tenants)

  useEffect(() => {
    dispatch(fetchRentPayments())
    dispatch(fetchTenants())
  }, [dispatch])

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue')
  const overduePayments = payments.filter(p => p.status === 'overdue')

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown Tenant'
  }

  const getTenantPhone = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.phone || 'No phone'
  }

  const getTenantProperty = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.propertyId || ''
  }

  const getPropertyName = (propertyId: string) => {
    // This would need access to properties, but for simplicity, we'll mock it
    const propertyNames: Record<string, string> = {
      '1': 'Shop A1',
      '2': 'Shop B2', 
      '3': 'Shop C3',
      '4': 'Shop D4',
      '5': 'Shop E5'
    }
    return propertyNames[propertyId] || 'Unknown Property'
  }

  const columns = [
    {
      key: 'tenantId',
      title: 'Tenant',
      render: (value: string) => (
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">{getTenantName(value)}</p>
            <p className="text-sm text-gray-600">{getTenantPhone(value)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      title: 'Property',
      render: (_: any, record: any) => (
        <span className="text-gray-900">{getPropertyName(getTenantProperty(record.tenantId))}</span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount Due',
      render: (value: number) => (
        <span className="font-bold text-danger-600">TZS {value.toLocaleString()}</span>
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
          <Button 
            size="sm" 
            variant="secondary" 
            icon={<Mail className="h-4 w-4" />}
            onClick={() => {
              // Handle send reminder
              alert(`Reminder sent to ${getTenantName(record.tenantId)}`)
            }}
          >
            Send Reminder
          </Button>
          <Button 
            size="sm" 
            variant="success"
            icon={<GiMoneyStack className="h-4 w-4" />}
            onClick={() => {
              // Handle mark as paid
              alert(`Marking payment as paid for ${getTenantName(record.tenantId)}`)
            }}
          >
            Mark Paid
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Payments</h1>
          <p className="text-gray-600 mt-1">Track overdue and pending rent payments</p>
        </div>
        <Link to="/rent">
          <Button variant="secondary" icon={<Calendar className="h-4 w-4" />}>
            View All Payments
          </Button>
        </Link>
      </div>

      {/* Alert Banner */}
      {overduePayments.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-danger-600 mr-2" />
            <p className="text-danger-800 font-medium">
              You have {overduePayments.length} overdue payment{overduePayments.length > 1 ? 's' : ''} 
              totaling TZS {totalOverdue.toLocaleString()}. Action required.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">{pendingPayments.length}</p>
            <p className="text-sm text-gray-600">Pending Payments</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-600">{overduePayments.length}</p>
            <p className="text-sm text-gray-600">Overdue Payments</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">TZS {totalPending.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Amount Due</p>
          </div>
        </Card>
      </div>

      {/* Filter Options */}
      <Card title="Filter Options" subtitle="Customize your view">
        <div className="flex items-center space-x-4">
          <Button variant={pendingPayments.length > 0 ? 'primary' : 'secondary'}>
            All Pending ({pendingPayments.length})
          </Button>
          <Button variant={overduePayments.length > 0 ? 'danger' : 'secondary'}>
            Overdue Only ({overduePayments.length})
          </Button>
        </div>
      </Card>

      {/* Pending Payments Table */}
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
          <Table
            columns={columns}
            data={pendingPayments}
            emptyMessage="No pending payments found."
          />
        )}
      </Card>
    </div>
  )
}