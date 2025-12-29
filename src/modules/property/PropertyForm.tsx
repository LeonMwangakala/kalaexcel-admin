import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { RootState, AppDispatch } from '../../store'
import { createProperty, updateProperty, fetchPropertyById } from './propertySlice'
import { fetchPropertyTypes, fetchLocations } from '../settings/settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input, Select } from '../../components/common/Form'
import { Controller } from 'react-hook-form'
import { Property } from '../../types'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

interface PropertyFormData {
  name: string
  propertyTypeId?: string
  locationId?: string
  size: string
  status: 'available' | 'occupied'
  monthlyRent: number
}

export default function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { properties, loading } = useSelector((state: RootState) => state.properties)
  const { propertyTypes, locations } = useSelector((state: RootState) => state.settings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const property = isEdit ? properties.find(p => p.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<PropertyFormData>({
    defaultValues: {
      name: '',
      propertyTypeId: '',
      locationId: '',
      size: '',
      status: 'available',
      monthlyRent: 0,
    },
  })

  useEffect(() => {
    dispatch(fetchPropertyTypes())
    dispatch(fetchLocations())
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id && !property) {
      dispatch(fetchPropertyById(id))
    }
  }, [isEdit, id, property, dispatch])

  useEffect(() => {
    if (isEdit && property) {
      // Reset form with property data when editing
      reset({
        name: property.name,
        propertyTypeId: property.propertyTypeId || '',
        locationId: property.locationId || '',
        size: property.size,
        status: property.status,
        monthlyRent: property.monthlyRent,
      })
    } else if (!isEdit) {
      // Reset form to empty values when creating new property
      reset({
        name: '',
        propertyTypeId: '',
        locationId: '',
        size: '',
        status: 'available',
        monthlyRent: 0,
      })
    }
  }, [isEdit, property, reset])

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateProperty({ id, data })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Property updated successfully',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createProperty({
          ...data,
          dateAdded: new Date().toISOString().split('T')[0],
        })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Property created successfully',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      navigate('/properties')
    } catch (error: any) {
      console.error('Error saving property:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to save property. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
  ]

  const propertyTypeOptions = [
    { value: '', label: 'Select Property Type' },
    ...propertyTypes.map(pt => ({
      value: pt.id,
      label: pt.name,
    })),
  ]

  const locationOptions = [
    { value: '', label: 'Select Location' },
    ...locations.map(l => ({
      value: l.id,
      label: l.name,
    })),
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/properties">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Properties
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update property information' : 'Enter property details'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Property Information" subtitle="Fill in the details below">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Property Name" name="name" required error={errors.name?.message}>
              <Input
                {...register('name', { required: 'Property name is required' })}
                placeholder="e.g., Shop A1"
              />
            </FormField>

            <FormField label="Property Type" name="propertyTypeId" error={errors.propertyTypeId?.message}>
              <Controller
                name="propertyTypeId"
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={propertyTypeOptions}
                    placeholder="Select property type"
                  />
                )}
              />
            </FormField>

            <FormField label="Location" name="locationId" error={errors.locationId?.message}>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={locationOptions}
                    placeholder="Select location"
                  />
                )}
              />
            </FormField>

            <FormField label="Size" name="size" required error={errors.size?.message}>
              <Input
                {...register('size', { required: 'Size is required' })}
                placeholder="e.g., 120 sq ft"
              />
            </FormField>

            <FormField label="Monthly Rent (TZS)" name="monthlyRent" required error={errors.monthlyRent?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('monthlyRent', { 
                  required: 'Monthly rent is required',
                  min: { value: 0, message: 'Rent must be positive' }
                })}
                placeholder="e.g., 2500"
              />
            </FormField>

            <FormField label="Status" name="status" required error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={statusOptions}
                    placeholder="Select status"
                  />
                )}
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Property' : 'Add Property'}
            </Button>
            <Link to="/properties">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}