import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createPayment, fetchReadingById, fetchCustomers } from './waterSupplySlice'
import { fetchAccounts } from '../banking/bankingSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { WaterSupplyPayment } from '../../types'
import { ArrowLeft } from 'lucide-react'

interface PaymentFormData {
  amount: number
  paymentDate: string
  bankAccountId: string
  bankReceipt?: string
  reference?: string
}

export default function WaterSupplyPaymentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { readings, customers, loading } = useSelector((state: RootState) => state.waterSupply)
  const { accounts } = useSelector((state: RootState) => state.banking)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const reading = readings.find(r => r.id === id)
  const customer = reading ? customers.find(c => c.id === reading.customerId) : null

  const readingAmountDue = reading 
    ? (typeof reading.amountDue === 'number' ? reading.amountDue : parseFloat(String(reading.amountDue || 0)))
    : 0

  const { register, handleSubmit, formState: { errors }, control } = useForm<PaymentFormData>({
    defaultValues: {
      amount: readingAmountDue,
      paymentDate: new Date().toISOString().split('T')[0],
      bankAccountId: '',
      bankReceipt: '',
    },
  })

  useEffect(() => {
    if (id) {
      dispatch(fetchReadingById(id))
      // Fetch all customers for the dropdown (using large perPage to get all)
      dispatch(fetchCustomers({ page: 1, perPage: 1000 }))
      dispatch(fetchAccounts())
    }
  }, [id, dispatch])

  const onSubmit = async (data: PaymentFormData) => {
    if (!reading) return

    setIsSubmitting(true)
    try {
      await dispatch(createPayment({
        readingId: reading.id,
        customerId: reading.customerId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: 'bank_transfer',
        bankAccountId: data.bankAccountId,
        bankReceipt: data.bankReceipt,
        reference: data.reference,
      })).unwrap()
      navigate('/water-supply/readings')
    } catch (error) {
      console.error('Error saving payment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const bankAccountOptions = accounts.map(account => ({
    value: account.id,
    label: `${account.accountName} - ${account.accountNumber} (${account.bankName})`,
  }))

  if (!reading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Reading not found</p>
            <Link to="/water-supply/readings">
              <Button className="mt-4">Back to Readings</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/water-supply/readings">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Readings
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600 mt-1">Record payment for water supply bill</p>
        </div>
      </div>

      {/* Reading Info */}
      <Card title="Bill Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium text-gray-900">{customer?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount Due</p>
            <p className="font-medium text-gray-900">
              TZS {
                typeof reading.amountDue === 'number' 
                  ? reading.amountDue.toFixed(2)
                  : parseFloat(String(reading.amountDue || 0)).toFixed(2)
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Units Consumed</p>
            <p className="font-medium text-gray-900">{reading.unitsConsumed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reading Date</p>
            <p className="font-medium text-gray-900">{new Date(reading.readingDate).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Payment Form */}
      <Card title="Payment Information" subtitle="Fill in the payment details">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Payment Date" name="paymentDate" required error={errors.paymentDate?.message}>
              <Input
                type="date"
                {...register('paymentDate', { required: 'Payment date is required' })}
              />
            </FormField>

            <FormField label="Amount (TZS)" name="amount" required error={errors.amount?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={readingAmountDue}
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' },
                  max: { 
                    value: readingAmountDue, 
                    message: `Amount cannot exceed TZS ${readingAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                  }
                })}
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

            <FormField label="Bank Receipt Number" name="bankReceipt" error={errors.bankReceipt?.message}>
              <Input
                {...register('bankReceipt')}
                placeholder="e.g., REC-123456"
              />
            </FormField>

            <FormField label="Reference (Optional)" name="reference" error={errors.reference?.message}>
              <Input
                {...register('reference')}
                placeholder="e.g., Check #1234"
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              Record Payment
            </Button>
            <Link to="/water-supply/readings">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

