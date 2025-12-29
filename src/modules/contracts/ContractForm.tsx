import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { RootState, AppDispatch } from '../../store'
import { createContract, updateContract, fetchContractById, fetchContracts } from './contractsSlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { fetchProperties } from '../property/propertySlice'
import { fetchLocations } from '../settings/settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input, Select, Textarea } from '../../components/common/Form'
import { Alert } from '../../components/common/Alert'
import { Controller } from 'react-hook-form'
import { Contract } from '../../types'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

interface ContractFormData {
  tenantId: string
  propertyId: string
  rentAmount: number
  startDate: string
  numberOfMonths: number
  endDate: string
  terms: string
  status: 'active' | 'expired' | 'terminated'
}

export default function ContractForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { contracts, loading } = useSelector((state: RootState) => state.contracts)
  const { tenants } = useSelector((state: RootState) => state.tenants)
  const { properties } = useSelector((state: RootState) => state.properties)
  const { locations } = useSelector((state: RootState) => state.settings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fetchedContract, setFetchedContract] = useState<Contract | null>(null)
  
  const isEdit = Boolean(id)
  const contract = isEdit ? (contracts.find(c => c.id === id) || fetchedContract) : null

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = useForm<ContractFormData>({
    defaultValues: {
      tenantId: '',
      propertyId: '',
      rentAmount: 0,
      startDate: '',
      numberOfMonths: 6,
      endDate: '',
      terms: '',
      status: 'active',
    },
  })

  const startDate = watch('startDate')
  const numberOfMonths = watch('numberOfMonths')
  const selectedTenantId = watch('tenantId')

  // Calculate end date when start date or number of months changes
  useEffect(() => {
    if (startDate && numberOfMonths && numberOfMonths > 0) {
      const start = new Date(startDate)
      const end = new Date(start)
      // Add the number of months
      end.setMonth(end.getMonth() + numberOfMonths)
      // Subtract one day to get the last day of the rental period
      // e.g., if start is Jan 1 and months is 6, end should be June 30
      end.setDate(end.getDate() - 1)
      const endDateString = end.toISOString().split('T')[0]
      setValue('endDate', endDateString, { shouldValidate: true })
    } else if (!startDate || !numberOfMonths) {
      setValue('endDate', '', { shouldValidate: false })
    }
  }, [startDate, numberOfMonths, setValue])

  // Clear property selection when tenant changes
  useEffect(() => {
    if (selectedTenantId && !isEdit) {
      // Reset property selection when tenant changes (only in create mode)
      setValue('propertyId', '', { shouldValidate: false })
    }
  }, [selectedTenantId, isEdit, setValue])

  useEffect(() => {
    dispatch(fetchTenants())
    dispatch(fetchProperties({ page: 1, perPage: 1000 })) // Fetch all properties for lookup
    dispatch(fetchLocations())
    // Don't fetch all contracts on mount - only fetch the specific one if editing
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id) {
      // Always fetch the contract to ensure we have the latest data
      dispatch(fetchContractById(id)).then((result) => {
        if (fetchContractById.fulfilled.match(result)) {
          setFetchedContract(result.payload)
        }
      })
    }
  }, [isEdit, id, dispatch])

  // Calculate number of months from start and end date when editing
  const calculateMonths = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 6
    const start = new Date(startDate)
    const end = new Date(endDate)
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    // Add 1 to include both start and end months
    return months + 1
  }

  useEffect(() => {
    if (isEdit && contract) {
      // Format dates for input fields (YYYY-MM-DD)
      const formatDate = (dateString: string) => {
        if (!dateString) return ''
        try {
          const date = new Date(dateString)
          if (isNaN(date.getTime())) return ''
          return date.toISOString().split('T')[0]
        } catch {
          return ''
        }
      }
      
      const months = calculateMonths(contract.startDate, contract.endDate)
      reset({
        tenantId: contract.tenantId || '',
        propertyId: contract.propertyId || '',
        rentAmount: contract.rentAmount || 0,
        startDate: formatDate(contract.startDate),
        numberOfMonths: months,
        endDate: formatDate(contract.endDate),
        terms: contract.terms || '',
        status: contract.status || 'active',
      })
    } else if (!isEdit) {
      reset({
        tenantId: '',
        propertyId: '',
        rentAmount: 0,
        startDate: '',
        numberOfMonths: 6,
        endDate: '',
        terms: '',
        status: 'active',
      })
    }
  }, [isEdit, contract, reset])

  const onSubmit = async (data: ContractFormData) => {
    setIsSubmitting(true)
    try {
      // Send numberOfMonths to backend (it will calculate endDate)
      // But also send endDate as calculated (backend will use numberOfMonths if provided)
      const contractData = {
        ...data,
        // Keep both numberOfMonths and endDate - backend will prefer numberOfMonths
      }
      
      if (isEdit && id) {
        await dispatch(updateContract({ id, data: contractData })).unwrap()
      } else {
        await dispatch(createContract(contractData)).unwrap()
      }
      navigate('/contracts')
    } catch (error: any) {
      console.error('Error saving contract:', error)
      // Error is handled by Redux and will be shown in the form
      if (error?.message) {
        alert(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLocationName = (locationId: string | undefined) => {
    if (!locationId) return ''
    const location = locations.find(l => l.id === locationId)
    return location?.name || ''
  }

  // Get properties with active contracts (excluding current contract if editing)
  const getPropertiesWithActiveContracts = () => {
    const today = new Date().toISOString().split('T')[0]
    return contracts
      .filter(c => {
        if (isEdit && contract && c.id === contract.id) return false // Exclude current contract
        return c.status === 'active' && c.endDate >= today
      })
      .map(c => c.propertyId)
  }

  // Filter out properties that are already leased (unless editing current contract)
  // Also filter by selected tenant's assigned properties
  const getAvailableProperties = () => {
    const leasedPropertyIds = getPropertiesWithActiveContracts()
    const currentPropertyId = isEdit && contract ? contract.propertyId : null
    
    // Get tenant's assigned properties if tenant is selected
    let tenantPropertyIds: string[] = []
    if (selectedTenantId) {
      const selectedTenant = tenants.find(t => t.id === selectedTenantId)
      if (selectedTenant && selectedTenant.propertyIds) {
        tenantPropertyIds = selectedTenant.propertyIds
      }
    }
    
    return properties.filter(p => {
      // If editing, allow the current property
      if (isEdit && currentPropertyId === p.id) {
        return true
      }
      
      // If tenant is selected, only show properties assigned to that tenant
      if (selectedTenantId && tenantPropertyIds.length > 0) {
        if (!tenantPropertyIds.includes(p.id)) {
          return false
        }
      }
      
      // Exclude properties with active contracts
      return !leasedPropertyIds.includes(p.id)
    })
  }

  const availableProperties = getAvailableProperties()
  const leasedProperties = properties.filter(p => {
    const leasedPropertyIds = getPropertiesWithActiveContracts()
    const currentPropertyId = isEdit && contract ? contract.propertyId : null
    return leasedPropertyIds.includes(p.id) && currentPropertyId !== p.id
  })

  const tenantOptions = [
    { value: '', label: 'Select Tenant' },
    ...tenants.map(t => ({
      value: t.id,
      label: `${t.name} (${t.businessType})`,
    })),
  ]

  const propertyOptions = [
    { value: '', label: 'Select Property' },
    ...availableProperties.map(p => ({
      value: p.id,
      label: p.locationId 
        ? `${p.name} - ${getLocationName(p.locationId)}`
        : p.name,
    })),
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'terminated', label: 'Terminated' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/contracts">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Contracts
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Contract' : 'Create New Contract'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update contract details' : 'Create a new rental agreement'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Contract Details" subtitle="Fill in the contract information">
        {loading && isEdit && !contract && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Loading contract data...</p>
          </div>
        )}
        {isEdit && contract?.contractNumber && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Contract Number:</span>{' '}
              <span className="font-mono text-primary-600">{contract.contractNumber}</span>
            </p>
          </div>
        )}
        {isEdit && !contract && !loading && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">Contract not found. Please go back and try again.</p>
          </div>
        )}
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Select Tenant" name="tenantId" required error={errors.tenantId?.message}>
              <Controller
                name="tenantId"
                control={control}
                rules={{ required: 'Tenant selection is required' }}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={tenantOptions}
                    placeholder="Select tenant"
                  />
                )}
              />
            </FormField>

            <FormField label="Select Property" name="propertyId" required error={errors.propertyId?.message}>
              <Controller
                name="propertyId"
                control={control}
                rules={{ required: 'Property selection is required' }}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={propertyOptions}
                    placeholder={selectedTenantId || isEdit ? "Select property" : "Select tenant first"}
                    isDisabled={!selectedTenantId && !isEdit}
                  />
                )}
              />
            </FormField>

            <FormField label="Monthly Rent (TZS)" name="rentAmount" required error={errors.rentAmount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('rentAmount', { 
                  required: 'Rent amount is required',
                  min: { value: 0, message: 'Rent must be positive' }
                })}
                placeholder="e.g., 2500"
              />
            </FormField>

            <FormField label="Contract Status" name="status" required error={errors.status?.message}>
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

            <FormField label="Start Date" name="startDate" required error={errors.startDate?.message}>
              <Input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
              />
            </FormField>

            <FormField label="Number of Months" name="numberOfMonths" required error={errors.numberOfMonths?.message}>
              <Input
                type="number"
                min="1"
                step="1"
                {...register('numberOfMonths', { 
                  required: 'Number of months is required',
                  min: { value: 1, message: 'Must be at least 1 month' }
                })}
                placeholder="e.g., 6"
              />
            </FormField>

            <FormField label="Contract End Date (Calculated)" name="endDate" error={errors.endDate?.message}>
              <Input
                type="date"
                {...register('endDate', { required: 'End date is required' })}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                This date is automatically calculated based on start date and number of months.
              </p>
            </FormField>
          </div>

          <FormField label="Contract Terms" name="terms" required error={errors.terms?.message}>
            <Textarea
              {...register('terms', { required: 'Contract terms are required' })}
              placeholder="Enter contract terms and conditions..."
              rows={4}
            />
          </FormField>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Contract' : 'Create Contract'}
            </Button>
            <Link to="/contracts">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}