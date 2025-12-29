import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { ConstructionExpense } from '../../types'
import { createExpense, updateExpense } from './constructionSlice'
import { fetchConstructionMaterials, fetchVendors } from '../settings/settingsSlice'
import { fetchAccounts } from '../banking/bankingSlice'
import { Form, FormField, Input, Textarea } from '../../components/common/Form'
import { Button } from '../../components/common/Button'
import { X } from 'lucide-react'
import Swal from 'sweetalert2'

interface ExpenseFormData {
  type: 'materials' | 'labor' | 'equipment'
  materialId?: string
  quantity?: number
  unitPrice?: number
  amount: number
  date: string
  vendorId: string
  bankAccountId: string
  description: string
  receiptUrl?: string
}

interface ExpenseFormProps {
  projectId: string
  expense?: ConstructionExpense
  onClose: () => void
}

export default function ExpenseForm({ projectId, expense, onClose }: ExpenseFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const constructionMaterials = useSelector((state: RootState) => state.settings.constructionMaterials)
  const vendors = useSelector((state: RootState) => state.settings.vendors)
  const bankAccounts = useSelector((state: RootState) => state.banking.accounts)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(expense)

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = useForm<ExpenseFormData>({
    defaultValues: {
      type: 'materials',
      materialId: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      vendorId: '',
      bankAccountId: '',
      description: '',
      receiptUrl: '',
    },
  })

  const watchedType = watch('type')
  const watchedQuantity = watch('quantity')
  const watchedUnitPrice = watch('unitPrice')

  // Calculate amount automatically when quantity or unitPrice changes
  useEffect(() => {
    const quantity = watchedQuantity || 0
    const unitPrice = watchedUnitPrice || 0
    const calculatedAmount = quantity * unitPrice
    setValue('amount', calculatedAmount)
  }, [watchedQuantity, watchedUnitPrice, setValue])

  useEffect(() => {
    dispatch(fetchConstructionMaterials())
    dispatch(fetchVendors())
    dispatch(fetchAccounts())
  }, [dispatch])

  useEffect(() => {
    if (isEdit && expense) {
      const quantity = expense.quantity || 1
      const unitPrice = expense.unitPrice || (expense.amount / quantity)
      reset({
        type: expense.type,
        materialId: expense.materialId || '',
        quantity: quantity,
        unitPrice: unitPrice,
        amount: expense.amount,
        date: expense.date,
        vendorId: expense.vendorId || '',
        bankAccountId: expense.bankAccountId || '',
        description: expense.description,
        receiptUrl: expense.receiptUrl || '',
      })
    } else {
      reset({
        type: 'materials',
        materialId: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        vendorId: '',
        bankAccountId: '',
        description: '',
        receiptUrl: '',
      })
    }
  }, [isEdit, expense, reset, dispatch])

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      const expenseData: any = {
        ...data,
        receiptUrl: data.receiptUrl || undefined,
        materialId: data.type === 'materials' ? (data.materialId || undefined) : undefined,
      }
      
      if (isEdit && expense) {
        await dispatch(updateExpense({ id: expense.id, data: expenseData })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Expense has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createExpense({ projectId, ...expenseData })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Expense has been created successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      onClose()
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to save expense. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const expenseTypeOptions = [
    { value: 'materials', label: 'Materials' },
    { value: 'labor', label: 'Labor' },
    { value: 'equipment', label: 'Equipment' },
  ]

  const materialOptions = constructionMaterials.map(material => ({
    value: material.id,
    label: `${material.name} (${material.unit})`,
  }))

  const vendorOptions = vendors.map(vendor => ({
    value: vendor.id,
    label: `${vendor.name} - ${vendor.location}`,
  }))

  const bankAccountOptions = bankAccounts.map(account => ({
    value: account.id,
    label: `${account.accountName} - ${account.bankName} (${account.accountNumber})`,
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Expense Type" name="type" required error={errors.type?.message}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Expense type is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={expenseTypeOptions}
                      placeholder="Select expense type..."
                      isSearchable={false}
                      onChange={(option) => {
                        field.onChange(option?.value || '')
                        // Clear materialId when type changes away from materials
                        if (option?.value !== 'materials') {
                          reset({ ...watch(), materialId: '' })
                        }
                      }}
                      value={expenseTypeOptions.find(opt => opt.value === field.value) || null}
                    />
                  )}
                />
              </FormField>

              {watchedType === 'materials' && (
                <FormField label="Material" name="materialId" required error={errors.materialId?.message}>
                  <Controller
                    name="materialId"
                    control={control}
                    rules={{ required: 'Material selection is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={materialOptions}
                        placeholder="Select a material..."
                        isSearchable
                        onChange={(option) => {
                          field.onChange(option?.value || '')
                        }}
                        value={materialOptions.find(opt => opt.value === field.value) || null}
                      />
                    )}
                  />
                </FormField>
              )}

              <FormField label="Quantity" name="quantity" required error={errors.quantity?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity must be positive' }
                  })}
                  placeholder="e.g., 10"
                />
              </FormField>

              <FormField label="Unit Price (TZS)" name="unitPrice" required error={errors.unitPrice?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('unitPrice', { 
                    required: 'Unit price is required',
                    min: { value: 0, message: 'Unit price must be positive' }
                  })}
                  placeholder="e.g., 50000"
                />
              </FormField>

              <FormField label="Total Amount (TZS)" name="amount" required error={errors.amount?.message}>
                <Input
                  type="number"
                  step="0.01"
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  placeholder="Auto-calculated"
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </FormField>

              <FormField label="Date" name="date" required error={errors.date?.message}>
                <Input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                />
              </FormField>

              <FormField label="Vendor" name="vendorId" required error={errors.vendorId?.message}>
                <Controller
                  name="vendorId"
                  control={control}
                  rules={{ required: 'Vendor selection is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={vendorOptions}
                      placeholder="Select a vendor..."
                      isSearchable
                      onChange={(option) => {
                        field.onChange(option?.value || '')
                      }}
                      value={vendorOptions.find(opt => opt.value === field.value) || null}
                    />
                  )}
                />
              </FormField>

              <FormField label="Bank Account" name="bankAccountId" required error={errors.bankAccountId?.message}>
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

              <div className="md:col-span-2">
                <FormField 
                  label="Receipt URL (Optional)" 
                  name="receiptUrl" 
                  error={errors.receiptUrl?.message}
                >
                  <Input
                    type="url"
                    {...register('receiptUrl')}
                    placeholder="https://example.com/receipt.pdf"
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField 
                  label="Description" 
                  name="description" 
                  required 
                  error={errors.description?.message}
                >
                  <Textarea
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Enter expense description..."
                    rows={4}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEdit ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

