import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchAccounts, fetchTransactions } from './bankingSlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { CreditCard, Edit, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

export default function BankingList() {
  const dispatch = useDispatch<AppDispatch>()
  const accounts = useSelector((state: RootState) => state.banking.accounts)
  const { transactions, transactionsPagination } = useSelector((state: RootState) => state.banking)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    dispatch(fetchAccounts())
    dispatch(fetchTransactions({ page: currentPage, perPage: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const getAccountName = (accountId: string, transaction?: any) => {
    // First try to get from transaction's nested account object (from API)
    if (transaction?.account?.accountName) {
      return transaction.account.accountName
    }
    // Fallback to Redux state
    const account = accounts.find(a => a.id === accountId)
    return account?.accountName || 'Unknown Account'
  }

  const getAccountBalance = (accountId: string, transaction?: any) => {
    // First try to get from transaction's nested account object (from API)
    if (transaction?.account?.openingBalance !== undefined) {
      return transaction.account.openingBalance
    }
    // Fallback to Redux state
    const account = accounts.find(a => a.id === accountId)
    return account?.openingBalance || 0
  }

  const columns = [
    {
      key: 'date',
      title: 'Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          {record.type === 'deposit' ? (
            <TrendingUp className="h-4 w-4 text-success-500 mr-2" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger-500 mr-2" />
          )}
          <span className="text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'accountId',
      title: 'Account',
      render: (value: string, record: any) => (
        <span className="text-gray-900">{getAccountName(value, record)}</span>
      ),
    },
    {
      key: 'category',
      title: 'Category',
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'deposit' ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number, record: any) => (
        <span className={`font-medium ${
          record.type === 'deposit' ? 'text-success-600' : 'text-danger-600'
        }`}>
          {record.type === 'deposit' ? '+' : '-'}TZS {Math.abs(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/banking/${record.id}/edit`}>
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
              console.log('Delete transaction:', record.id)
            }}
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  const accountColumns = [
    {
      key: 'accountName',
      title: 'Account Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-primary-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{record.bankName} - {record.branchName} - {record.accountNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <span className="text-gray-900 capitalize">{value}</span>
      ),
    },
    {
      key: 'openingBalance',
      title: 'Opening Balance',
      render: (value: number) => (
        <span className="font-bold text-gray-900">TZS {Number(value).toLocaleString('en-US')}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/banking/account/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Link to={`/banking/new?accountId=${record.id}`}>
            <Button size="sm" variant="primary" icon={<Plus className="h-4 w-4" />}>
              Add Transaction
            </Button>
          </Link>
        </div>
      ),
      className: 'text-right',
    },
  ]

  const totalBalance = accounts.reduce((sum, a) => {
    const balance = typeof a.openingBalance === 'number' ? a.openingBalance : parseFloat(String(a.openingBalance || 0))
    return sum + (isNaN(balance) ? 0 : balance)
  }, 0)
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const currentDate = new Date()
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear()
  })
  
  const depositsThisMonth = currentMonthTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  
  const withdrawalsThisMonth = currentMonthTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banking</h1>
          <p className="text-gray-600 mt-1">Manage bank accounts and transactions</p>
        </div>
        <Link to="/banking/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">TZS {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-gray-600">Total Balance</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">TZS {depositsThisMonth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-gray-600">Deposits This Month</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-600">TZS {withdrawalsThisMonth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-gray-600">Withdrawals This Month</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            <p className="text-sm text-gray-600">Bank Accounts</p>
          </div>
        </Card>
      </div>

      {/* Bank Accounts */}
      <Card 
        title="Bank Accounts" 
        subtitle="Your business bank accounts"
        actions={
          <Link to="/banking/account/new">
            <Button size="sm" icon={<Plus className="h-4 w-4" />}>
              Add Account
            </Button>
          </Link>
        }
      >
        <Table
          columns={accountColumns}
          data={accounts}
          emptyMessage="No bank accounts found. Add your first account to get started."
        />
      </Card>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" subtitle="Latest financial activities">
        <Table
          columns={columns}
          data={transactions}
          emptyMessage="No transactions found."
          showSerialNumber
          serialNumberStart={transactionsPagination ? (transactionsPagination.currentPage - 1) * transactionsPagination.perPage + 1 : 1}
        />
        {transactionsPagination && transactionsPagination.total > 0 && (
          <Pagination
            currentPage={transactionsPagination.currentPage}
            totalPages={transactionsPagination.lastPage}
            totalItems={transactionsPagination.total}
            itemsPerPage={transactionsPagination.perPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage)
              setCurrentPage(1)
            }}
          />
        )}
      </Card>
    </div>
  )
}