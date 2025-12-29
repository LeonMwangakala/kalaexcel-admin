import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { fetchVendors, createVendor, updateVendor, deleteVendor } from './settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Table } from '../../components/common/Table'
import { Form, FormField, Input } from '../../components/common/Form'
import { useForm } from 'react-hook-form'
import { Vendor } from '../../types'
import { Edit, Trash2, Plus, X, Building2 } from 'lucide-react'

interface VendorFormData {
  name: string
  location: string
  phone: string
}

export default function VendorsSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const vendors = useSelector((state: RootState) => state.settings.vendors)
  const { loading } = useSelector((state: RootState) => state.settings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VendorFormData>()

  const editingItem = editingId ? vendors.find(v => v.id === editingId) : null

  const onSubmit = async (data: VendorFormData) => {
    try {
      if (editingId && editingItem) {
        await dispatch(updateVendor({ id: editingId, data })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Vendor has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createVendor(data)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Vendor has been created successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      reset()
      setEditingId(null)
      setShowForm(false)
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to save vendor. Please try again.',
      })
    }
  }

  const handleEdit = (id: string) => {
    const item = vendors.find(v => v.id === id)
    if (item) {
      setEditingId(id)
      setShowForm(true)
      reset({
        name: item.name,
        location: item.location,
        phone: item.phone,
      })
    }
  }

  const handleDelete = async (id: string) => {
    const item = vendors.find(v => v.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: item 
        ? `You are about to delete vendor "${item.name}". This action cannot be undone!`
        : 'You are about to delete this vendor. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteVendor(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Vendor has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete vendor. Please try again.',
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
      title: 'Vendor Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'location',
      title: 'Location',
    },
    {
      key: 'phone',
      title: 'Phone',
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
    <div className="space-y-6">
      <Card 
        title="Vendors" 
        subtitle="Manage construction vendors"
        actions={
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              reset()
              setEditingId(null)
              setShowForm(true)
            }}
          >
            Add Vendor
          </Button>
        }
      >
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Vendor Name" name="name" required error={errors.name?.message}>
                  <Input
                    {...register('name', { required: 'Vendor name is required' })}
                    placeholder="e.g., ABC Supplies Ltd"
                  />
                </FormField>
                <FormField label="Location" name="location" required error={errors.location?.message}>
                  <Input
                    {...register('location', { required: 'Location is required' })}
                    placeholder="e.g., Dar es Salaam"
                  />
                </FormField>
                <FormField label="Phone Number" name="phone" required error={errors.phone?.message}>
                  <Input
                    {...register('phone', { required: 'Phone number is required' })}
                    placeholder="e.g., +255 123 456 789"
                  />
                </FormField>
              </div>
              <div className="flex items-center space-x-4">
                <Button type="submit" loading={loading}>
                  {editingId ? 'Update Vendor' : 'Create Vendor'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        )}

        <Table
          columns={columns}
          data={vendors}
          emptyMessage="No vendors found. Add your first vendor to get started."
        />
      </Card>
    </div>
  )
}

