import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createCollection, updateCollection, fetchCollectionById } from './waterWellSlice'
import { fetchUsers } from '../users/usersSlice'
import { fetchAccounts } from '../banking/bankingSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { WaterWellCollection } from '../../types'
import { ArrowLeft } from 'lucide-react'

interface WaterWellFormData {
  date: string
  bucketsSold: number
  unitPrice: number
  operatorId: string
  bankAccountId: string
  notes?: string
}

export default function WaterWellForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { collections, loading } = useSelector((state: RootState) => state.waterWell)
  const { users } = useSelector((state: RootState) => state.users)
  const { accounts } = useSelector((state: RootState) => state.banking)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const collection = isEdit ? collections.find(c => c.id === id) : null

  // Filter users to only cashiers and operators
  const operatorUsers = users.filter(user => 
    user.role === 'cashier' || user.role === 'operator'
  )

  const operatorOptions = operatorUsers.map(user => ({
    value: user.id,
    label: user.name,
  }))

  const bankAccountOptions = accounts.map(account => ({
    value: account.id,
    label: `${account.accountName} - ${account.accountNumber} (${account.bankName})`,
  }))

  const { register, handleSubmit, formState: { errors }, watch, reset, control } = useForm<WaterWellFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      bucketsSold: 0,
      unitPrice: 5,
      operatorId: '',
      bankAccountId: '',
      notes: '',
    },
  })

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 1000 }))
    dispatch(fetchAccounts())
    if (isEdit && id && !collection) {
      dispatch(fetchCollectionById(id))
    }
  }, [isEdit, id, collection, dispatch])

  useEffect(() => {
    if (isEdit && collection) {
      reset({
        date: collection.date,
        bucketsSold: collection.bucketsSold,
        unitPrice: collection.unitPrice,
        operatorId: collection.operatorId,
        bankAccountId: collection.bankAccountId,
        notes: collection.notes,
      })
    } else if (!isEdit) {
      reset({
        date: new Date().toISOString().split('T')[0],
        bucketsSold: 0,
        unitPrice: 5,
        operatorId: '',
        bankAccountId: '',
        notes: '',
      })
    }
  }, [isEdit, collection, reset])

  const bucketsSold = watch('bucketsSold') || 0
  const unitPrice = watch('unitPrice') || 0
  const totalAmount = bucketsSold * unitPrice

  const onSubmit = async (data: WaterWellFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateCollection({ id, data: { ...data, totalAmount: data.bucketsSold * data.unitPrice } })).unwrap()
      } else {
        await dispatch(createCollection({ ...data, totalAmount: data.bucketsSold * data.unitPrice, isDeposited: false })).unwrap()
      }
      navigate('/water-well')
    } catch (error) {
      console.error('Error saving collection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/water-well">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Collections
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Collection' : 'Record Daily Collection'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update collection information' : 'Enter daily collection details'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Collection Information" subtitle="Fill in the details below">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Date" name="date" required error={errors.date?.message}>
              <Input
                type="date"
                {...register('date', { required: 'Date is required' })}
              />
            </FormField>

            <FormField label="Operator" name="operatorId" required error={errors.operatorId?.message}>
              <Controller
                name="operatorId"
                control={control}
                rules={{ required: 'Operator is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value ? operatorOptions.find(option => option.value === field.value) || null : null}
                    onChange={(selected) => {
                      field.onChange(selected ? selected.value : '')
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={operatorOptions}
                    placeholder="Select operator"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: errors.operatorId ? '#ef4444' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
            </FormField>

            <FormField label="Bank Account" name="bankAccountId" required error={errors.bankAccountId?.message}>
              <Controller
                name="bankAccountId"
                control={control}
                rules={{ required: 'Bank account is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value ? bankAccountOptions.find(option => option.value === field.value) || null : null}
                    onChange={(selected) => {
                      field.onChange(selected ? selected.value : '')
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={bankAccountOptions}
                    placeholder="Select bank account"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: errors.bankAccountId ? '#ef4444' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
            </FormField>

            <FormField label="Buckets/Containers Sold" name="bucketsSold" required error={errors.bucketsSold?.message}>
              <Input
                type="number"
                step="1"
                min="0"
                {...register('bucketsSold', { 
                  required: 'Number of buckets is required',
                  min: { value: 0, message: 'Buckets must be positive' }
                })}
                placeholder="e.g., 320"
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
                placeholder="e.g., 5.00"
              />
            </FormField>

            <FormField label="Notes" name="notes" error={errors.notes?.message}>
              <Input
                {...register('notes')}
                placeholder="Optional notes..."
              />
            </FormField>
          </div>

          {/* Calculated Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-primary-600">TZS {totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Collection' : 'Record Collection'}
            </Button>
            <Link to="/water-well">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

