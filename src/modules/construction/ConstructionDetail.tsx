import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { RootState, AppDispatch } from '../../store'
import { fetchProjectById, fetchExpenses, updateProject } from './constructionSlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { FormField, Input } from '../../components/common/Form'
import { ArrowLeft, Plus, HardHat, Edit } from 'lucide-react'
import ExpenseForm from './ExpenseForm'
import Swal from 'sweetalert2'

export default function ConstructionDetail() {
  const { id } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const projects = useSelector((state: RootState) => state.construction.projects)
  const { expenses: allExpenses, expensesPagination, loading } = useSelector((state: RootState) => state.construction)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  const project = projects.find(p => p.id === id)
  const projectExpenses = allExpenses.filter(e => e.projectId === id)

  useEffect(() => {
    if (id) {
      // Always fetch project and expenses on mount/refresh
      if (!project && !isFetching) {
        setIsFetching(true)
        dispatch(fetchProjectById(id)).finally(() => setIsFetching(false))
      }
      // Always fetch expenses for this project with pagination
      dispatch(fetchExpenses({ projectId: id, page: currentPage, perPage: itemsPerPage }))
    }
  }, [id, dispatch, currentPage, itemsPerPage])

  // Show loading state while fetching
  if ((loading || isFetching) && !project) {
    return (
      <div className="space-y-4">
        <Link to="/construction">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Projects
          </Button>
        </Link>
        <Card>
          <p className="text-gray-700">Loading project...</p>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to="/construction">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Projects
          </Button>
        </Link>
        <Card>
          <p className="text-gray-700">Project not found.</p>
        </Card>
      </div>
    )
  }

  const totalSpent = projectExpenses.reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0))), 0)
  const projectBudget = typeof project.budget === 'number' ? project.budget : parseFloat(String(project.budget || 0))
  const remaining = Math.max(projectBudget - totalSpent, 0)
  const progressPercent = typeof project.progress === 'number' ? project.progress : parseFloat(String(project.progress || 0))

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<{ progress: number }>({
    defaultValues: {
      progress: progressPercent,
    },
  })

  const watchedProgress = watch('progress')

  useEffect(() => {
    if (project) {
      const currentProgress = typeof project.progress === 'number' ? project.progress : parseFloat(String(project.progress || 0))
      reset({ progress: currentProgress })
    }
  }, [project, reset])

  const onProgressSubmit = async (data: any) => {
    if (!project || !id) return
    
    setIsUpdatingProgress(true)
    try {
      const progressValue = typeof data.progress === 'number' ? data.progress : parseFloat(String(data.progress || 0))
      await dispatch(updateProject({ id, data: { progress: progressValue } })).unwrap()
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Project progress has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
      setShowProgressForm(false)
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to update progress. Please try again.',
      })
    } finally {
      setIsUpdatingProgress(false)
    }
  }

  const expenseColumns: any[] = [
    {
      key: 'date',
      title: 'Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string, record: any) => {
        // If type is materials and we have material data, show material name
        if (value === 'materials') {
          const materialName = record.material?.name
          if (materialName) {
            return (
              <div>
                <span className="capitalize">{value}</span>
                <span className="text-gray-500 ml-2">({materialName})</span>
              </div>
            )
          }
        }
        // Otherwise just show the type
        return <span className="capitalize">{value}</span>
      },
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (value: any) => {
        if (value === undefined || value === null) return '-'
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return isNaN(numValue) ? '-' : numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      },
    },
    {
      key: 'vendor',
      title: 'Vendor',
      render: (_: any, record: any) => {
        // Check for nested vendor data from API
        if (record.vendor?.name) {
          return record.vendor.name
        }
        // Fallback to vendorId if vendor object not available
        return record.vendorId || 'N/A'
      },
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: any) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0))
        return `TZS ${numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      },
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => <span className="text-gray-700">{value}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/construction">
            <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <HardHat className="h-6 w-6 text-warning-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
          </div>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowExpenseForm(true)}>
          Add Expense
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Budget</p>
          <p className="text-2xl font-semibold text-gray-900">TZS {projectBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Spent</p>
          <p className="text-2xl font-semibold text-danger-600">TZS {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-2xl font-semibold text-success-600">TZS {remaining.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Progress</p>
            <Button
              size="sm"
              variant="secondary"
              icon={<Edit className="h-3 w-3" />}
              onClick={() => setShowProgressForm(true)}
            >
              Update
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-700 font-medium">{progressPercent}%</span>
          </div>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Project Details">
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span className="font-medium">Start Date</span>
              <span>{format(new Date(project.startDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">End Date</span>
              <span>{project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'In Progress'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status</span>
              <span className="capitalize">{project.status.replace('_', ' ')}</span>
            </div>
          </div>
        </Card>

        <Card title="Spending Overview">
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Total Expenses</span>
              <span>TZS {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Budget Utilization</span>
              <span>{projectBudget > 0 ? ((totalSpent / projectBudget) * 100).toFixed(1) : '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Budget</span>
              <span>TZS {remaining.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses */}
      <Card title="Expenses" subtitle="All expenses for this project" actions={
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowExpenseForm(true)}>
          Add Expense
        </Button>
      }>
        <Table
          columns={expenseColumns}
          data={projectExpenses}
          emptyMessage="No expenses recorded yet. Add your first expense."
          showSerialNumber
          serialNumberStart={expensesPagination ? (expensesPagination.currentPage - 1) * expensesPagination.perPage + 1 : 1}
        />
        {expensesPagination && expensesPagination.total > 0 && (
          <Pagination
            currentPage={expensesPagination.currentPage}
            totalPages={expensesPagination.lastPage}
            totalItems={expensesPagination.total}
            itemsPerPage={expensesPagination.perPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage)
              setCurrentPage(1)
            }}
          />
        )}
      </Card>

      {/* Expense modal */}
      {showExpenseForm && (
        <ExpenseForm
          projectId={project.id}
          onClose={() => setShowExpenseForm(false)}
        />
      )}

      {/* Progress Update Modal */}
      {showProgressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Project Progress</h3>
              <button
                onClick={() => setShowProgressForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onProgressSubmit)} className="space-y-4">
              <FormField label="Progress (%)" name="progress" required error={errors.progress?.message}>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  {...register('progress', {
                    required: 'Progress is required',
                    min: { value: 0, message: 'Progress must be between 0 and 100' },
                    max: { value: 100, message: 'Progress must be between 0 and 100' },
                  })}
                />
              </FormField>
              
              {/* Visual Progress Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Preview</span>
                  <span className="text-gray-700 font-medium">{watchedProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${watchedProgress || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <Button type="submit" loading={isUpdatingProgress} className="flex-1">
                  Update Progress
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowProgressForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}


