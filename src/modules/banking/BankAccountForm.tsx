import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createAccount, updateAccount, fetchAccountById } from './bankingSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { BankAccount } from '../../types'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

interface BankAccountFormData {
  accountName: string
  bankName: string
  branchName: string
  accountNumber: string
  openingBalance: number
  type: 'checking' | 'savings' | 'business'
}

export default function BankAccountForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { accounts, loading } = useSelector((state: RootState) => state.banking)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const account = isEdit ? accounts.find(a => a.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<BankAccountFormData>({
    defaultValues: {
      accountName: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      openingBalance: 0,
      type: 'checking',
    },
  })

  useEffect(() => {
    if (isEdit && id && !account) {
      dispatch(fetchAccountById(id))
    }
  }, [isEdit, id, account, dispatch])

  useEffect(() => {
    if (isEdit && account) {
      reset({
        accountName: account.accountName,
        bankName: account.bankName,
        branchName: account.branchName,
        accountNumber: account.accountNumber,
        openingBalance: account.openingBalance,
        type: account.type,
      })
    } else if (!isEdit) {
      reset({
        accountName: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        openingBalance: 0,
        type: 'checking',
      })
    }
  }, [isEdit, account, reset])

  const onSubmit = async (data: BankAccountFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateAccount({ id, data })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Bank account has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createAccount(data)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Bank account has been created successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      navigate('/banking')
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to save bank account. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'business', label: 'Business' },
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
            {isEdit ? 'Edit Bank Account' : 'Create Bank Account'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update bank account information' : 'Add a new bank account to your system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Bank Account Details" subtitle="Enter bank account information">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Bank Name" name="bankName" required error={errors.bankName?.message}>
              <Input
                {...register('bankName', { required: 'Bank name is required' })}
                placeholder="e.g., First National Bank"
              />
            </FormField>

            <FormField label="Branch Name" name="branchName" required error={errors.branchName?.message}>
              <Input
                {...register('branchName', { required: 'Branch name is required' })}
                placeholder="e.g., Main Branch"
              />
            </FormField>

            <FormField label="Account Name" name="accountName" required error={errors.accountName?.message}>
              <Input
                {...register('accountName', { required: 'Account name is required' })}
                placeholder="e.g., Business Operating Account"
              />
            </FormField>

            <FormField label="Account Number" name="accountNumber" required error={errors.accountNumber?.message}>
              <Input
                {...register('accountNumber', { required: 'Account number is required' })}
                placeholder="e.g., 1234567890"
              />
            </FormField>

            <FormField label="Opening Balance (TZS)" name="openingBalance" required error={errors.openingBalance?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('openingBalance', { 
                  required: 'Opening balance is required',
                  min: { value: 0, message: 'Opening balance must be 0 or greater' }
                })}
                placeholder="e.g., 0.00"
              />
            </FormField>

            <FormField label="Account Type" name="type" required error={errors.type?.message}>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Account type is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={typeOptions}
                    placeholder="Select account type..."
                    isSearchable={false}
                    onChange={(option) => {
                      field.onChange(option?.value || '')
                    }}
                    value={typeOptions.find(opt => opt.value === field.value) || null}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Account' : 'Create Account'}
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

