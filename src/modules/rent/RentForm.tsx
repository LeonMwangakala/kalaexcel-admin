import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createRentPayment, updateRentPayment, fetchRentPaymentById } from './rentSlice'
import { fetchContracts } from '../contracts/contractsSlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { fetchAccounts } from '../banking/bankingSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { RentPayment } from '../../types'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

interface PaymentFormData {
  contractId: string
  bankAccountId: string
  amount: number
  paymentDate: string
  bankReceipt?: string
}

export default function RentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { payments, loading } = useSelector((state: RootState) => state.rent)
  const { contracts } = useSelector((state: RootState) => state.contracts)
  const { accounts } = useSelector((state: RootState) => state.banking)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  
  const isEdit = Boolean(id)
  const payment = isEdit ? payments.find(p => p.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<PaymentFormData>({
    defaultValues: {
      contractId: '',
      bankAccountId: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
    },
  })

  const watchedAmount = watch('amount')
  const watchedContractId = watch('contractId')

  useEffect(() => {
    dispatch(fetchContracts({ page: 1, perPage: 1000 }))
    dispatch(fetchTenants({}))
    dispatch(fetchAccounts())
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id && !payment) {
      dispatch(fetchRentPaymentById(id))
    }
  }, [isEdit, id, payment, dispatch])

  useEffect(() => {
    if (isEdit && payment) {
      // Find contract to set selected contract
      const contract = contracts.find(c => c.id === payment.contractId)
      setSelectedContract(contract || null)
      
      reset({
        contractId: payment.contractId || '',
        bankAccountId: payment.bankAccountId || '',
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        bankReceipt: payment.bankReceipt || '',
      })
    } else if (!isEdit) {
      reset({
        contractId: '',
        bankAccountId: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        bankReceipt: '',
      })
      setSelectedContract(null)
    }
  }, [isEdit, payment, reset, contracts])

  // Update selected contract when contractId changes
  useEffect(() => {
    if (watchedContractId) {
      const contract = contracts.find(c => c.id === watchedContractId)
      setSelectedContract(contract || null)
    } else {
      setSelectedContract(null)
    }
  }, [watchedContractId, contracts])


  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    try {
      const paymentData: Omit<RentPayment, 'id'> = {
        tenantId: selectedContract?.tenantId || '',
        contractId: data.contractId,
        bankAccountId: data.bankAccountId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: 'bank_transfer',
        bankReceipt: data.bankReceipt,
        status: 'pending', // Will be calculated on backend
        // month will be calculated from paymentDate on backend
      }

      if (isEdit && id) {
        await dispatch(updateRentPayment({ 
          id, 
          data: paymentData
        })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Payment has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createRentPayment({
          data: paymentData
        })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Recorded!',
          text: 'Payment has been recorded successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      navigate('/rent')
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to save payment. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const { tenants } = useSelector((state: RootState) => state.tenants)
  
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown Tenant'
  }

  const contractOptions = contracts
    .filter(c => c.status === 'active')
    .map(c => ({
      value: c.id,
      label: `${c.contractNumber || 'N/A'} - ${getTenantName(c.tenantId)} (TZS ${Number(c.rentAmount).toLocaleString('en-US')}/month)`,
      contract: c,
    }))

  const bankAccountOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.accountName} - ${a.bankName} (${a.branchName}) - ${a.accountNumber}`,
  }))

  // Calculate payment status
  const contractRentAmount = selectedContract ? Number(selectedContract.rentAmount) : 0
  const paymentAmount = Number(watchedAmount) || 0
  const isFullPayment = paymentAmount >= contractRentAmount && contractRentAmount > 0
  const isPartialPayment = paymentAmount > 0 && paymentAmount < contractRentAmount
  const remainingAmount = contractRentAmount - paymentAmount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/rent">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Payments
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Payment' : 'Record Payment'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update payment information' : 'Record a new rent payment from a contract'}
          </p>
        </div>
      </div>

      {/* Contract Info Card */}
      {selectedContract && (
        <Card title="Contract Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Contract Number</p>
              <p className="text-lg font-semibold text-gray-900">{selectedContract.contractNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Rent Amount</p>
              <p className="text-lg font-semibold text-primary-600">
                TZS {Number(selectedContract.rentAmount).toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className={`text-lg font-semibold ${
                isFullPayment ? 'text-success-600' : 
                isPartialPayment ? 'text-warning-600' : 
                'text-gray-600'
              }`}>
                {isFullPayment ? 'Full Payment' : isPartialPayment ? 'Partial Payment' : 'Not Paid'}
              </p>
            </div>
          </div>
          {isPartialPayment && (
            <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-800">
                <strong>Remaining Amount:</strong> TZS {remainingAmount.toLocaleString('en-US')}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Form */}
      <Card title="Payment Details" subtitle="Enter payment information">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Select Contract" name="contractId" required error={errors.contractId?.message}>
              <Controller
                name="contractId"
                control={control}
                rules={{ required: 'Contract selection is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={contractOptions}
                    placeholder="Select a contract..."
                    isSearchable
                    onChange={(option) => {
                      field.onChange(option?.value || '')
                    }}
                    value={contractOptions.find(opt => opt.value === field.value) || null}
                  />
                )}
              />
            </FormField>

            <FormField label="Select Bank Account" name="bankAccountId" required error={errors.bankAccountId?.message}>
              <Controller
                name="bankAccountId"
                control={control}
                rules={{ required: 'Bank account selection is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={bankAccountOptions}
                    placeholder="Select a bank account..."
                    isSearchable
                    onChange={(option) => {
                      field.onChange(option?.value || '')
                    }}
                    value={bankAccountOptions.find(opt => opt.value === field.value) || null}
                  />
                )}
              />
            </FormField>

            <FormField label="Amount Paid (TZS)" name="amount" required error={errors.amount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                placeholder="e.g., 250000"
              />
              {selectedContract && (
                <p className="mt-1 text-sm text-gray-500">
                  Contract rent: TZS {Number(selectedContract.rentAmount).toLocaleString('en-US')}
                </p>
              )}
            </FormField>

            <FormField label="Payment Date" name="paymentDate" required error={errors.paymentDate?.message}>
              <Input
                type="date"
                {...register('paymentDate', { required: 'Payment date is required' })}
              />
            </FormField>

            <FormField label="Bank Receipt Number" name="bankReceipt" error={errors.bankReceipt?.message}>
              <Input
                type="text"
                {...register('bankReceipt')}
                placeholder="e.g., REC-2024-001234"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the bank receipt/reference number
              </p>
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Payment' : 'Record Payment'}
            </Button>
            <Link to="/rent">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
