import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { fetchConstructionMaterials, createConstructionMaterial, updateConstructionMaterial, deleteConstructionMaterial } from './settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Table } from '../../components/common/Table'
import { Form, FormField, Input, Textarea } from '../../components/common/Form'
import { useForm } from 'react-hook-form'
import { ConstructionMaterial } from '../../types'
import { Edit, Trash2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

interface ConstructionMaterialFormData {
  name: string
  unit: string
  description?: string
}

export default function ConstructionMaterialsSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const materials = useSelector((state: RootState) => state.settings.constructionMaterials)
  const { loading } = useSelector((state: RootState) => state.settings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    dispatch(fetchConstructionMaterials())
  }, [dispatch])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ConstructionMaterialFormData>()

  const editingItem = editingId ? materials.find(cm => cm.id === editingId) : null

  const onSubmit = async (data: ConstructionMaterialFormData) => {
    try {
      if (editingId && editingItem) {
        await dispatch(updateConstructionMaterial({ id: editingId, data })).unwrap()
      } else {
        await dispatch(createConstructionMaterial(data)).unwrap()
      }
      reset()
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving construction material:', error)
    }
  }

  const handleEdit = (id: string) => {
    const item = materials.find(cm => cm.id === id)
    if (item) {
      setEditingId(id)
      setShowForm(true)
      reset({
        name: item.name,
        unit: item.unit,
        description: item.description,
      })
    }
  }

  const handleDelete = async (id: string) => {
    const item = constructionMaterials.find(cm => cm.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: item 
        ? `You are about to delete construction material "${item.name}". This action cannot be undone!`
        : 'You are about to delete this construction material. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteConstructionMaterial(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Construction material has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete construction material. Please try again.',
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
      key: 'unit',
      title: 'Unit',
      render: (value: string) => <span className="text-gray-600">{value}</span>,
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
      title="Construction Materials" 
      subtitle="Manage construction material types and units"
      actions={
        !showForm ? (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Add Material
          </Button>
        ) : null
      }
    >
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Construction Material' : 'Add New Construction Material'}
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
                  placeholder="e.g., Cement"
                />
              </FormField>
              <FormField label="Unit" name="unit" required error={errors.unit?.message}>
                <Input
                  {...register('unit', { required: 'Unit is required' })}
                  placeholder="e.g., bags, kg, pieces, liters"
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
              {editingId ? 'Update' : 'Add'} Material
            </Button>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading construction materials...</div>
      ) : (
        <Table
          columns={columns}
          data={materials}
          emptyMessage="No construction materials found. Add your first material to get started."
        />
      )}
    </Card>
  )
}

