import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchProjects, fetchExpenses } from './constructionSlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { HardHat, Edit, Trash2, Plus, TrendingUp, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import ExpenseForm from './ExpenseForm'

export default function ConstructionList() {
  const dispatch = useDispatch<AppDispatch>()
  const { projects, projectsPagination, loading } = useSelector((state: RootState) => state.construction)
  const expenses = useSelector((state: RootState) => state.construction.expenses)
  const [expenseFormProjectId, setExpenseFormProjectId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    dispatch(fetchProjects({ page: currentPage, perPage: itemsPerPage }))
    dispatch(fetchExpenses({}))
  }, [dispatch, currentPage, itemsPerPage])

  const getProjectExpenses = (projectId: string) => {
    return expenses.filter(e => e.projectId === projectId)
  }

  const getProjectTotalSpent = (projectId: string) => {
    const projectExpenses = getProjectExpenses(projectId)
    return projectExpenses.reduce((sum, e) => {
      const amount = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }

  const columns = [
    {
      key: 'name',
      title: 'Project Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <HardHat className="h-5 w-5 text-warning-500 mr-2" />
          <div>
            <Link to={`/construction/${record.id}`}>
              <p className="font-medium text-primary-700 hover:text-primary-900 hover:underline">
                {value}
              </p>
            </Link>
            <p className="text-sm text-gray-600">{record.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'startDate',
      title: 'Start Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'endDate',
      title: 'End Date',
      render: (value: string | undefined) => value ? format(new Date(value), 'MMM dd, yyyy') : 'In Progress',
    },
    {
      key: 'budget',
      title: 'Budget',
      render: (value: number | string) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return `TZS ${numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      },
    },
    {
      key: 'totalSpent',
      title: 'Spent',
      render: (value: number, record: any) => {
        const actualSpent = getProjectTotalSpent(record.id)
        const recordBudget = typeof record.budget === 'number' ? record.budget : parseFloat(String(record.budget || 0))
        const percentage = recordBudget > 0 ? (actualSpent / recordBudget) * 100 : 0
        return (
          <div>
            <p className="font-medium text-gray-900">TZS {actualSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of budget</p>
          </div>
        )
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'in_progress' ? 'bg-primary-100 text-primary-800' :
          value === 'completed' ? 'bg-success-100 text-success-800' :
          value === 'on_hold' ? 'bg-warning-100 text-warning-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
        </span>
      ),
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (value: number) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{value}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="primary" 
            icon={<DollarSign className="h-4 w-4" />}
            onClick={() => setExpenseFormProjectId(record.id)}
          >
            Add Expense
          </Button>
          <Link to={`/construction/${record.id}/edit`}>
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
              console.log('Delete project:', record.id)
            }}
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const totalBudget = projects.reduce((sum, p) => {
    const budget = typeof p.budget === 'number' ? p.budget : parseFloat(String(p.budget || 0))
    return sum + (isNaN(budget) ? 0 : budget)
  }, 0)
  const totalSpent = expenses.reduce((sum, e) => {
    const amount = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Construction Projects</h1>
          <p className="text-gray-600 mt-1">Manage building projects and expenses</p>
        </div>
        <Link to="/construction/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{projects.length.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Projects</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{activeProjects.toLocaleString()}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{completedProjects.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">TZS {totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </Card>
      </div>

      {/* Projects Table */}
      <Card title="Projects List" subtitle="All construction projects">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={projects}
              emptyMessage="No construction projects found. Create your first project to get started."
              showSerialNumber
              serialNumberStart={projectsPagination ? (projectsPagination.currentPage - 1) * projectsPagination.perPage + 1 : 1}
            />
            {projectsPagination && projectsPagination.total > 0 && (
              <Pagination
                currentPage={projectsPagination.currentPage}
                totalPages={projectsPagination.lastPage}
                totalItems={projectsPagination.total}
                itemsPerPage={projectsPagination.perPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}
      </Card>

      {/* Expense Form Modal */}
      {expenseFormProjectId && (
        <ExpenseForm
          projectId={expenseFormProjectId}
          onClose={() => setExpenseFormProjectId(null)}
        />
      )}
    </div>
  )
}