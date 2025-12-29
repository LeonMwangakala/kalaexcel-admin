import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { fetchBusinessTypes, createBusinessType, updateBusinessType, deleteBusinessType } from './settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Table } from '../../components/common/Table'
import { Form, FormField, Input, Textarea } from '../../components/common/Form'
import { useForm } from 'react-hook-form'
import { BusinessType } from '../../types'
import { Edit, Trash2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

interface BusinessTypeFormData {
  name: string
  description?: string
}

export default function BusinessTypesSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const businessTypes = useSelector((state: RootState) => state.settings.businessTypes)
  const { loading } = useSelector((state: RootState) => state.settings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BusinessTypeFormData>()

  useEffect(() => {
    dispatch(fetchBusinessTypes())
  }, [dispatch])

  const editingItem = editingId ? businessTypes.find(bt => bt.id === editingId) : null

  const onSubmit = async (data: BusinessTypeFormData) => {
    try {
      if (editingId && editingItem) {
        await dispatch(updateBusinessType({ id: editingId, data })).unwrap()
      } else {
        await dispatch(createBusinessType(data)).unwrap()
      }
      reset()
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving business type:', error)
    }
  }

  const handleEdit = (id: string) => {
    const item = businessTypes.find(bt => bt.id === id)
    if (item) {
      setEditingId(id)
      setShowForm(true)
      reset({
        name: item.name,
        description: item.description,
      })
    }
  }

  const handleDelete = async (id: string) => {
    const item = businessTypes.find(bt => bt.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: item 
        ? `You are about to delete business type "${item.name}". This action cannot be undone!`
        : 'You are about to delete this business type. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteBusinessType(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Business type has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete business type. Please try again.',
        })
      }
    }
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setShowForm(false)
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value: string) => <span className="font-medium text-gray-900">{value}</span>,
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
      title="Business Types" 
      subtitle="Manage business type categories"
      actions={
        !showForm ? (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Add Business Type
          </Button>
        ) : null
      }
    >
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Business Type' : 'Add New Business Type'}
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
                  placeholder="e.g., Electronics Store"
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
              {editingId ? 'Update' : 'Add'} Business Type
            </Button>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading business types...</div>
      ) : (
        <Table
          columns={columns}
          data={businessTypes}
          emptyMessage="No business types found. Add your first business type to get started."
        />
      )}
    </Card>
  )
}

