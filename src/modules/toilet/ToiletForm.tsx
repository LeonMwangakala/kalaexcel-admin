import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createCollection, updateCollection, fetchCollectionById } from './toiletSlice'
import { fetchUsers } from '../users/usersSlice'
import { fetchAccounts } from '../banking/bankingSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { ToiletCollection } from '../../types'
import { ArrowLeft } from 'lucide-react'

interface ToiletFormData {
  date: string
  totalUsers: number
  amountCollected: number
  cashierId: string
  bankAccountId: string
  notes?: string
}

export default function ToiletForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { collections, loading } = useSelector((state: RootState) => state.toilet)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const collection = isEdit ? collections.find(c => c.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ToiletFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      totalUsers: 0,
      amountCollected: 0,
      cashierId: '',
      bankAccountId: '',
      notes: '',
    },
  })

  const { users } = useSelector((state: RootState) => state.users)
  const { accounts } = useSelector((state: RootState) => state.banking)
  
  // Filter users to only cashiers and operators
  const cashierOperatorUsers = users.filter(user => 
    user.role === 'cashier' || user.role === 'operator'
  )

  const cashierOptions = cashierOperatorUsers.map(user => ({
    value: user.id,
    label: `${user.name} (${user.role})`,
  }))

  const bankAccountOptions = accounts.map(account => ({
    value: account.id,
    label: `${account.accountName} - ${account.accountNumber} (${account.bankName})`,
  }))

  useEffect(() => {
    // Fetch users and bank accounts on mount
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
        totalUsers: collection.totalUsers,
        amountCollected: collection.amountCollected,
        cashierId: collection.cashierId,
        bankAccountId: collection.bankAccountId,
        notes: collection.notes,
      })
    } else if (!isEdit) {
      reset({
        date: new Date().toISOString().split('T')[0],
        totalUsers: 0,
        amountCollected: 0,
        cashierId: '',
        bankAccountId: '',
        notes: '',
      })
    }
  }, [isEdit, collection, reset])

  const onSubmit = async (data: ToiletFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateCollection({ id, data })).unwrap()
      } else {
        await dispatch(createCollection({ ...data, isDeposited: false })).unwrap()
      }
      navigate('/toilet')
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
        <Link to="/toilet">
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

            <FormField label="Cashier/Operator" name="cashierId" required error={errors.cashierId?.message}>
              <Controller
                name="cashierId"
                control={control}
                rules={{ required: 'Cashier/Operator is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={cashierOptions.find(option => option.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value || '')}
                    options={cashierOptions}
                    placeholder="Select cashier or operator"
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: errors.cashierId ? '#ef4444' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
            </FormField>

            <FormField label="Total Users" name="totalUsers" required error={errors.totalUsers?.message}>
              <Input
                type="number"
                step="1"
                min="0"
                {...register('totalUsers', { 
                  required: 'Total users is required',
                  min: { value: 0, message: 'Users must be positive' }
                })}
                placeholder="e.g., 145"
              />
            </FormField>

            <FormField label="Amount Collected (TZS)" name="amountCollected" required error={errors.amountCollected?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('amountCollected', { 
                  required: 'Amount collected is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                placeholder="e.g., 1450"
              />
            </FormField>

            <FormField label="Bank Account" name="bankAccountId" required error={errors.bankAccountId?.message}>
              <Controller
                name="bankAccountId"
                control={control}
                rules={{ required: 'Bank account is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={bankAccountOptions.find(option => option.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value || '')}
                    options={bankAccountOptions}
                    placeholder="Select bank account"
                    isClearable
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

            <FormField label="Notes" name="notes" error={errors.notes?.message}>
              <Input
                {...register('notes')}
                placeholder="Optional notes..."
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Collection' : 'Record Collection'}
            </Button>
            <Link to="/toilet">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

