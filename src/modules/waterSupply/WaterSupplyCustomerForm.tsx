import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createCustomer, updateCustomer, fetchCustomerById } from './waterSupplySlice'
import { fetchLocations } from '../settings/settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { WaterSupplyCustomer } from '../../types'
import { ArrowLeft } from 'lucide-react'

interface CustomerFormData {
  name: string
  phone: string
  location: string
  meterNumber: string
  startingReading: number
  unitPrice: number
  status: 'active' | 'inactive'
}

export default function WaterSupplyCustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { customers, loading } = useSelector((state: RootState) => state.waterSupply)
  const { locations } = useSelector((state: RootState) => state.settings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const customer = isEdit ? customers.find(c => c.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<CustomerFormData>({
    defaultValues: {
      name: '',
      phone: '',
      location: '',
      meterNumber: '',
      startingReading: 0,
      unitPrice: 2.5,
      status: 'active',
    },
  })

  useEffect(() => {
    dispatch(fetchLocations())
    if (isEdit && id && !customer) {
      dispatch(fetchCustomerById(id))
    }
  }, [isEdit, id, customer, dispatch])

  useEffect(() => {
    if (isEdit && customer) {
      reset({
        name: customer.name,
        phone: customer.phone,
        location: customer.location,
        meterNumber: customer.meterNumber,
        startingReading: customer.startingReading,
        unitPrice: customer.unitPrice,
        status: customer.status,
      })
    } else if (!isEdit) {
      reset({
        name: '',
        phone: '',
        location: '',
        meterNumber: '',
        startingReading: 0,
        unitPrice: 2.5,
        status: 'active',
      })
    }
  }, [isEdit, customer, reset])

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateCustomer({ id, data })).unwrap()
      } else {
        await dispatch(createCustomer({ ...data, dateRegistered: new Date().toISOString() })).unwrap()
      }
      navigate('/water-supply/customers')
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const locationOptions = locations.map(location => ({
    value: location.name,
    label: location.name,
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/water-supply/customers">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Customers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Customer' : 'Register Water Supply Customer'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update customer information' : 'Enter customer details'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Customer Information" subtitle="Fill in the details below">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Customer Name" name="name" required error={errors.name?.message}>
              <Input
                {...register('name', { required: 'Customer name is required' })}
                placeholder="e.g., Ahmed Hassan"
              />
            </FormField>

            <FormField label="Phone" name="phone" required error={errors.phone?.message}>
              <Input
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="e.g., +1-555-0123"
              />
            </FormField>

            <FormField label="Location" name="location" required error={errors.location?.message}>
              <Controller
                name="location"
                control={control}
                rules={{ required: 'Location is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value ? locationOptions.find(option => option.value === field.value) || null : null}
                    onChange={(selected) => {
                      field.onChange(selected ? selected.value : '')
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={locationOptions}
                    placeholder="Select location"
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: errors.location ? '#ef4444' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
            </FormField>

            <FormField label="Meter Number" name="meterNumber" required error={errors.meterNumber?.message}>
              <Input
                {...register('meterNumber', { required: 'Meter number is required' })}
                placeholder="e.g., WS-001"
              />
            </FormField>

            <FormField label="Starting Reading" name="startingReading" required error={errors.startingReading?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('startingReading', { 
                  required: 'Starting reading is required',
                  min: { value: 0, message: 'Reading must be positive' }
                })}
                placeholder="e.g., 0"
              />
            </FormField>

            <FormField label="Unit Price (TZS)" name="unitPrice" required error={errors.unitPrice?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('unitPrice', { 
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="e.g., 2.50"
              />
            </FormField>

            <FormField label="Status" name="status" required error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={statusOptions.find(option => option.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value || '')}
                    options={statusOptions}
                    placeholder="Select status"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: errors.status ? '#ef4444' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Customer' : 'Register Customer'}
            </Button>
            <Link to="/water-supply/customers">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

