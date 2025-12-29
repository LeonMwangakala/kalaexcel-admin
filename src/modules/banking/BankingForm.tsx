import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { RootState, AppDispatch } from '../../store'
import { createTransaction, updateTransaction, fetchTransactionById } from './bankingSlice'
import { fetchAccounts } from './bankingSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input, Select, Textarea } from '../../components/common/Form'
import { BankTransaction } from '../../types'
import { ArrowLeft } from 'lucide-react'

interface TransactionFormData {
  accountId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  description: string
  category: string
  reference: string
}

export default function BankingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams] = useSearchParams()
  const { transactions, accounts, loading } = useSelector((state: RootState) => state.banking)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const transaction = isEdit ? transactions.find(t => t.id === id) : null
  const preselectedAccountId = searchParams.get('accountId')

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<TransactionFormData>({
    defaultValues: {
      accountId: preselectedAccountId || '',
      type: 'deposit',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      reference: '',
    },
  })

  const transactionType = watch('type')

  useEffect(() => {
    dispatch(fetchAccounts())
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id && !transaction) {
      dispatch(fetchTransactionById(id))
    }
  }, [isEdit, id, transaction, dispatch])

  useEffect(() => {
    if (isEdit && transaction) {
      reset({
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        reference: transaction.reference || '',
      })
    } else if (!isEdit) {
      reset({
        accountId: preselectedAccountId || '',
        type: 'deposit',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        reference: '',
      })
    }
  }, [isEdit, transaction, reset, preselectedAccountId])

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateTransaction({ id, data })).unwrap()
      } else {
        await dispatch(createTransaction(data)).unwrap()
      }
      navigate('/banking')
    } catch (error) {
      console.error('Error saving transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const accountOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.name} (${a.bankName} ${a.accountNumber})`,
  }))

  const categoryOptions = transactionType === 'deposit' ? [
    { value: 'Rent Income', label: 'Rent Income' },
    { value: 'Construction Income', label: 'Construction Income' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Other Income', label: 'Other Income' },
  ] : [
    { value: 'Construction', label: 'Construction Expenses' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Taxes', label: 'Taxes' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Other Expenses', label: 'Other Expenses' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/banking">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Banking
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update transaction details' : 'Record a new bank transaction'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Transaction Details" subtitle="Enter the transaction information">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Bank Account" name="accountId" required error={errors.accountId?.message}>
              <Select {...register('accountId', { required: 'Account selection is required' })} options={accountOptions} />
            </FormField>

            <FormField label="Transaction Type" name="type" required error={errors.type?.message}>
              <Select {...register('type', { required: 'Transaction type is required' })} 
                     options={[
                       { value: 'deposit', label: 'Deposit' },
                       { value: 'withdrawal', label: 'Withdrawal' },
                     ]} />
            </FormField>

            <FormField label="Amount (TZS)" name="amount" required error={errors.amount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                placeholder="e.g., 2500.00"
              />
            </FormField>

            <FormField label="Transaction Date" name="date" required error={errors.date?.message}>
              <Input
                type="date"
                {...register('date', { required: 'Date is required' })}
              />
            </FormField>

            <FormField label="Category" name="category" required error={errors.category?.message}>
              <Select {...register('category', { required: 'Category is required' })} options={categoryOptions} />
            </FormField>

            <FormField label="Reference (Optional)" name="reference" error={errors.reference?.message}>
              <Input
                {...register('reference')}
                placeholder="e.g., RENT-001, CHECK-123"
              />
            </FormField>
          </div>

          <FormField label="Description" name="description" required error={errors.description?.message}>
            <Textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Enter transaction description..."
              rows={3}
            />
          </FormField>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Transaction' : 'Add Transaction'}
            </Button>
            <Link to="/banking">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}