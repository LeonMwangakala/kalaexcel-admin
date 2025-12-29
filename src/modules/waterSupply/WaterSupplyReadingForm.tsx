import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createReading, updateReading, fetchReadingById, fetchCustomers } from './waterSupplySlice'
import { waterSupplyReadingService } from '../../services/waterSupplyService'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { WaterSupplyReading } from '../../types'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

interface ReadingFormData {
  customerId: string
  readingDate: string
  meterReading: number
}

export default function WaterSupplyReadingForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { readings, customers, loading } = useSelector((state: RootState) => state.waterSupply)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerReadings, setCustomerReadings] = useState<WaterSupplyReading[]>([])
  
  const isEdit = Boolean(id)
  const reading = isEdit ? readings.find(r => r.id === id) : null
  const customerIdFromUrl = searchParams.get('customerId')

  const { register, handleSubmit, formState: { errors }, watch, reset, control } = useForm<ReadingFormData>({
    defaultValues: {
      customerId: customerIdFromUrl || '',
      readingDate: new Date().toISOString().split('T')[0],
      meterReading: 0,
    },
  })

  useEffect(() => {
    // Fetch all customers for the dropdown (using large perPage to get all)
    dispatch(fetchCustomers({ page: 1, perPage: 1000 }))
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id && !reading) {
      dispatch(fetchReadingById(id))
    }
  }, [isEdit, id, reading, dispatch])

  useEffect(() => {
    if (isEdit && reading) {
      reset({
        customerId: reading.customerId,
        readingDate: reading.readingDate,
        meterReading: reading.meterReading,
      })
    } else if (!isEdit) {
      reset({
        customerId: customerIdFromUrl || '',
        readingDate: new Date().toISOString().split('T')[0],
        meterReading: 0,
      })
    }
  }, [isEdit, reading, reset, customerIdFromUrl])

  const selectedCustomerId = watch('customerId')
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)
  const meterReading = watch('meterReading')

  // Fetch all readings for the selected customer to calculate previous reading
  useEffect(() => {
    if (selectedCustomerId && !isEdit) {
      // Fetch all readings for this customer (without pagination) to get accurate previous reading
      waterSupplyReadingService.getAll(selectedCustomerId, { page: 1, perPage: 1000 })
        .then((result) => {
          setCustomerReadings(result.data)
        })
        .catch((error) => {
          console.error('Error fetching customer readings:', error)
          setCustomerReadings([])
        })
    } else if (isEdit && reading) {
      // For edit mode, fetch all readings for the customer
      waterSupplyReadingService.getAll(reading.customerId, { page: 1, perPage: 1000 })
        .then((result) => {
          setCustomerReadings(result.data)
        })
        .catch((error) => {
          console.error('Error fetching customer readings:', error)
          setCustomerReadings([])
        })
    } else {
      setCustomerReadings([])
    }
  }, [selectedCustomerId, isEdit, reading])

  // Get previous reading for the customer
  const getPreviousReading = (customerId: string) => {
    if (!customerId) return null
    const sortedReadings = [...customerReadings]
      .filter(r => r.customerId === customerId)
      .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime())
    // If editing, exclude the current reading from previous reading calculation
    const readingsToUse = isEdit && reading 
      ? sortedReadings.filter(r => r.id !== reading.id)
      : sortedReadings
    return readingsToUse.length > 0 ? readingsToUse[0].meterReading : selectedCustomer?.startingReading || 0
  }

  const previousReading = selectedCustomerId ? getPreviousReading(selectedCustomerId) : 0
  const unitsConsumed = meterReading && previousReading ? Math.max(0, meterReading - previousReading) : 0
  const customerUnitPrice = selectedCustomer 
    ? (typeof selectedCustomer.unitPrice === 'number' ? selectedCustomer.unitPrice : parseFloat(String(selectedCustomer.unitPrice || 0)))
    : 0
  const amountDue = unitsConsumed && selectedCustomer ? unitsConsumed * customerUnitPrice : 0

  const onSubmit = async (data: ReadingFormData) => {
    setIsSubmitting(true)
    try {
      const prevReading = getPreviousReading(data.customerId) || 0
      const units = Math.max(0, data.meterReading - prevReading)
      const customer = customers.find(c => c.id === data.customerId)
      const customerUnitPrice = customer 
        ? (typeof customer.unitPrice === 'number' ? customer.unitPrice : parseFloat(String(customer.unitPrice || 0)))
        : 0
      const amount = units * customerUnitPrice

      if (isEdit && id) {
        await dispatch(updateReading({ 
          id, 
          data: {
            ...data,
            previousReading: prevReading,
            unitsConsumed: units,
            amountDue: amount,
          }
        })).unwrap()
        // Navigate back to customer readings if customerId was in URL, otherwise to all readings
        if (customerIdFromUrl || reading?.customerId) {
          const customerId = customerIdFromUrl || reading?.customerId
          navigate(`/water-supply/customers/${customerId}/readings`)
        } else {
          navigate('/water-supply/readings')
        }
      } else {
        await dispatch(createReading({
          ...data,
          previousReading: prevReading,
          unitsConsumed: units,
          amountDue: amount,
          paymentStatus: 'pending',
          month: format(new Date(data.readingDate), 'yyyy-MM'),
        })).unwrap()
        // Navigate back to customer readings if customerId was in URL, otherwise to all readings
        if (customerIdFromUrl) {
          navigate(`/water-supply/customers/${customerIdFromUrl}/readings`)
        } else {
          navigate('/water-supply/readings')
        }
      }
    } catch (error) {
      console.error('Error saving reading:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const customerOptions = customers.map(c => ({
    value: c.id,
    label: `${c.name} (${c.meterNumber})`,
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to={customerIdFromUrl ? `/water-supply/customers/${customerIdFromUrl}/readings` : '/water-supply/readings'}>
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            {customerIdFromUrl ? 'Back to Customer Readings' : 'Back to Readings'}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Reading' : 'Record Meter Reading'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update reading information' : 'Enter meter reading details'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Reading Information" subtitle="Fill in the details below">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Customer" name="customerId" required error={errors.customerId?.message}>
              <Controller
                name="customerId"
                control={control}
                rules={{ required: 'Customer is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value ? customerOptions.find(option => option.value === field.value) || null : null}
                    onChange={(selected) => {
                      field.onChange(selected ? selected.value : '')
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={customerOptions}
                    placeholder="Select customer"
                    isDisabled={isEdit}
                    isClearable={!isEdit}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: errors.customerId ? '#ef4444' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
            </FormField>

            <FormField label="Reading Date" name="readingDate" required error={errors.readingDate?.message}>
              <Input
                type="date"
                {...register('readingDate', { required: 'Reading date is required' })}
              />
            </FormField>

            <FormField label="Meter Reading" name="meterReading" required error={errors.meterReading?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('meterReading', { 
                  required: 'Meter reading is required',
                  min: { value: previousReading, message: `Reading must be >= ${previousReading}` }
                })}
                placeholder="e.g., 1250"
              />
            </FormField>
          </div>

          {/* Calculated Fields */}
          {selectedCustomerId && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Previous Reading</p>
                  <p className="text-lg font-semibold text-gray-900">{previousReading.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Units Consumed</p>
                  <p className="text-lg font-semibold text-primary-600">{unitsConsumed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Due</p>
                  <p className="text-lg font-semibold text-success-600">TZS {amountDue.toFixed(2)}</p>
                </div>
              </div>
              {selectedCustomer && (
                <p className="text-xs text-gray-500 mt-2">
                  Unit Price: TZS {
                    typeof selectedCustomer.unitPrice === 'number' 
                      ? selectedCustomer.unitPrice.toFixed(2)
                      : parseFloat(String(selectedCustomer.unitPrice || 0)).toFixed(2)
                  } per unit
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Reading' : 'Record Reading'}
            </Button>
            <Link to={customerIdFromUrl ? `/water-supply/customers/${customerIdFromUrl}/readings` : '/water-supply/readings'}>
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

