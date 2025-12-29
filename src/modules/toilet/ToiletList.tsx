import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { markAsDeposited, fetchCollections } from './toiletSlice'
import { Edit, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { PiToilet } from 'react-icons/pi'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export default function ToiletList() {
  const { collections, pagination, loading } = useSelector((state: RootState) => state.toilet)
  const dispatch = useDispatch<AppDispatch>()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    dispatch(fetchCollections({ page: currentPage, perPage: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const handleMarkDeposited = async (id: string) => {
    const depositId = `DEP-${Date.now()}`
    const depositDate = new Date().toISOString().split('T')[0]
    try {
      await dispatch(markAsDeposited({ id, depositId, depositDate })).unwrap()
    } catch (error) {
      console.error('Failed to mark as deposited:', error)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayCollection = collections.find(c => {
    const collectionDate = c.date ? new Date(c.date).toISOString().split('T')[0] : null
    return collectionDate === today
  })
  const todayAmount = todayCollection?.amountCollected 
    ? parseFloat(String(todayCollection.amountCollected)) 
    : 0

  const currentMonth = format(new Date(), 'yyyy-MM')
  const monthlyCollections = collections.filter(c => {
    if (!c.date) return false
    const collectionDate = new Date(c.date).toISOString().split('T')[0]
    return collectionDate.startsWith(currentMonth)
  })
  const monthlyTotal = monthlyCollections.reduce((sum, c) => {
    const amount = parseFloat(String(c.amountCollected)) || 0
    return sum + amount
  }, 0)

  const depositedTotal = collections
    .filter(c => c.isDeposited)
    .reduce((sum, c) => {
      const amount = parseFloat(String(c.amountCollected)) || 0
      return sum + amount
    }, 0)
  
  const collectedTotal = collections.reduce((sum, c) => {
    const amount = parseFloat(String(c.amountCollected)) || 0
    return sum + amount
  }, 0)
  
  const missingDeposits = collections.filter(c => !c.isDeposited)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const columns = [
    {
      key: 'date',
      title: 'Date',
      render: (value: string) => (
        <div className="flex items-center">
          <PiToilet className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{format(new Date(value), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'totalUsers',
      title: 'Total Users',
      render: (value: number) => (
        <span className="text-gray-900">{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'amountCollected',
      title: 'Amount Collected',
      render: (value: number) => {
        const amount = parseFloat(String(value)) || 0
        return (
          <span className="font-medium text-gray-900">
            TZS {amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        )
      },
    },
    {
      key: 'cashier',
      title: 'Cashier/Operator',
      render: (value: any, record: any) => (
        <span className="text-gray-900">
          {record.cashier?.name || record.cashierId || 'N/A'}
        </span>
      ),
    },
    {
      key: 'isDeposited',
      title: 'Deposit Status',
      render: (value: boolean, record: any) => (
        <div className="flex items-center space-x-2">
          {value ? (
            <>
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-sm text-success-600">Deposited</span>
              {record.depositDate && (
                <span className="text-xs text-gray-500">
                  ({format(new Date(record.depositDate), 'MMM dd')})
                </span>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-warning-600" />
              <span className="text-sm text-warning-600">Pending</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/toilet/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          {!record.isDeposited && (
            <Button 
              size="sm" 
              variant="success" 
              icon={<CheckCircle className="h-4 w-4" />}
              onClick={() => handleMarkDeposited(record.id)}
            >
              Mark Deposited
            </Button>
          )}
          <Button 
            size="sm" 
            variant="danger" 
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              console.log('Delete collection:', record.id)
            }}
          >
            Delete
          </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Public Toilet Collections</h1>
          <p className="text-gray-600 mt-1">Track daily collections and deposits</p>
        </div>
        <Link to="/toilet/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Record Collection
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              TZS {todayAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-600">Today's Collection</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              TZS {monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-600">Monthly Total</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              TZS {depositedTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-600">Total Deposited</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">{missingDeposits.length}</p>
            <p className="text-sm text-gray-600">Missing Deposits</p>
          </div>
        </Card>
      </div>

      {/* Collections Table */}
      <Card title="Daily Collections" subtitle="All collection records">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading collections...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={collections}
              emptyMessage="No collections recorded. Record your first collection to get started."
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

