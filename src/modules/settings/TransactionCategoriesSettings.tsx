import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { fetchTransactionCategories, createTransactionCategory, updateTransactionCategory, deleteTransactionCategory } from './settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Table } from '../../components/common/Table'
import { Form, FormField, Input, Select, Textarea } from '../../components/common/Form'
import { useForm, Controller } from 'react-hook-form'
import { TransactionCategory } from '../../types'
import { Edit, Trash2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

interface TransactionCategoryFormData {
  name: string
  type: 'income' | 'expense'
  description?: string
}

export default function TransactionCategoriesSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const categories = useSelector((state: RootState) => state.settings.transactionCategories)
  const { loading } = useSelector((state: RootState) => state.settings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    dispatch(fetchTransactionCategories())
  }, [dispatch])

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<TransactionCategoryFormData>()

  const editingItem = editingId ? categories.find(tc => tc.id === editingId) : null

  const onSubmit = async (data: TransactionCategoryFormData) => {
    try {
      if (editingId && editingItem) {
        await dispatch(updateTransactionCategory({ id: editingId, data })).unwrap()
      } else {
        await dispatch(createTransactionCategory(data)).unwrap()
      }
      reset()
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving transaction category:', error)
    }
  }

  const handleEdit = (id: string) => {
    const item = categories.find(tc => tc.id === id)
    if (item) {
      setEditingId(id)
      setShowForm(true)
      reset({
        name: item.name,
        type: item.type,
        description: item.description,
      })
    }
  }

  const handleDelete = async (id: string) => {
    const item = categories.find(tc => tc.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: item 
        ? `You are about to delete transaction category "${item.name}". This action cannot be undone!`
        : 'You are about to delete this transaction category. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteTransactionCategory(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Transaction category has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete transaction category. Please try again.',
        })
      }
    }
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setShowForm(false)
  }

  const typeOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ]

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value: string) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'income' ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => <span className="text-gray-600">{value || '-'}</span>,
    },
    {
      key: 'dateCreated',
      title: 'Date Created',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => handleEdit(record.id)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <Card 
      title="Transaction Categories" 
      subtitle="Manage transaction categories for income and expenses"
      actions={
        !showForm ? (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Add Category
          </Button>
        ) : null
      }
    >
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Transaction Category' : 'Add New Transaction Category'}
            </h3>
            <Button size="sm" variant="secondary" icon={<X className="h-4 w-4" />} onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Name" name="name" required error={errors.name?.message}>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g., Rent Income"
                />
              </FormField>
              <FormField label="Type" name="type" required error={errors.type?.message}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <Select
                      value={field.value ? typeOptions.find(option => option.value === field.value) || null : null}
                      onChange={(selected) => {
                        field.onChange(selected ? selected.value : '')
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      options={typeOptions}
                      placeholder="Select type"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderColor: errors.type ? '#ef4444' : base.borderColor,
                        }),
                      }}
                    />
                  )}
                />
              </FormField>
              <FormField label="Description" name="description" error={errors.description?.message}>
                <Textarea
                  {...register('description')}
                  placeholder="Optional description"
                  rows={2}
                />
              </FormField>
            </div>
            <Button type="submit">
              {editingId ? 'Update' : 'Add'} Category
            </Button>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading transaction categories...</div>
      ) : (
        <Table
          columns={columns}
          data={categories}
          emptyMessage="No transaction categories found. Add your first category to get started."
        />
      )}
    </Card>
  )
}

