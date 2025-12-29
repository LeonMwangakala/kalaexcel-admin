import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { fetchLocations, createLocation, updateLocation, deleteLocation } from './settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Table } from '../../components/common/Table'
import { Form, FormField, Input, Textarea } from '../../components/common/Form'
import { useForm } from 'react-hook-form'
import { Location } from '../../types'
import { Edit, Trash2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

interface LocationFormData {
  name: string
  description?: string
  address?: string
}

export default function LocationsSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const locations = useSelector((state: RootState) => state.settings.locations)
  const { loading } = useSelector((state: RootState) => state.settings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    dispatch(fetchLocations())
  }, [dispatch])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LocationFormData>()

  const editingItem = editingId ? locations.find(l => l.id === editingId) : null

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (editingId && editingItem) {
        await dispatch(updateLocation({ id: editingId, data })).unwrap()
      } else {
        await dispatch(createLocation(data)).unwrap()
      }
      reset()
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving location:', error)
    }
  }

  const handleEdit = (id: string) => {
    const item = locations.find(l => l.id === id)
    if (item) {
      setEditingId(id)
      setShowForm(true)
      reset({
        name: item.name,
        description: item.description,
        address: item.address,
      })
    }
  }

  const handleDelete = async (id: string) => {
    const item = locations.find(loc => loc.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: item 
        ? `You are about to delete location "${item.name}". This action cannot be undone!`
        : 'You are about to delete this location. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteLocation(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Location has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete location. Please try again.',
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
      key: 'address',
      title: 'Address',
      render: (value: string) => <span className="text-gray-600">{value || '-'}</span>,
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
      title="Locations" 
      subtitle="Manage property locations"
      actions={
        !showForm ? (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Add Location
          </Button>
        ) : null
      }
    >
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Location' : 'Add New Location'}
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
                  placeholder="e.g., Downtown Mall"
                />
              </FormField>
              <FormField label="Address" name="address" error={errors.address?.message}>
                <Input
                  {...register('address')}
                  placeholder="e.g., 123 Main Street, City"
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
              {editingId ? 'Update' : 'Add'} Location
            </Button>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading locations...</div>
      ) : (
        <Table
          columns={columns}
          data={locations}
          emptyMessage="No locations found. Add your first location to get started."
        />
      )}
    </Card>
  )
}

