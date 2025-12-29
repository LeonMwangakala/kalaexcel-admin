import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { RootState, AppDispatch } from '../../store'
import { createTenant, updateTenant, fetchTenantById } from './tenantsSlice'
import { fetchProperties } from '../property/propertySlice'
import { fetchBusinessTypes, fetchLocations } from '../settings/settingsSlice'
import { fetchContracts } from '../contracts/contractsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input, Select, MultiSelect } from '../../components/common/Form'
import { Alert } from '../../components/common/Alert'
import { Controller } from 'react-hook-form'
import { Tenant } from '../../types'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

interface TenantFormData {
  name: string
  phone: string
  idNumber: string
  businessType: string
  propertyIds: string[]
  status: 'active' | 'ended' | 'pending_payment'
}

export default function TenantForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { tenants, loading } = useSelector((state: RootState) => state.tenants)
  const { properties } = useSelector((state: RootState) => state.properties)
  const { contracts } = useSelector((state: RootState) => state.contracts)
  const { businessTypes } = useSelector((state: RootState) => state.settings)
  const { locations } = useSelector((state: RootState) => state.settings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const tenant = isEdit ? tenants.find(t => t.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control, setError } = useForm<TenantFormData>({
    defaultValues: {
      name: '',
      phone: '',
      idNumber: '',
      businessType: '',
      propertyIds: [],
      status: 'active',
    },
  })


  useEffect(() => {
    dispatch(fetchProperties())
    dispatch(fetchBusinessTypes())
    dispatch(fetchLocations())
    dispatch(fetchContracts())
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id && !tenant) {
      dispatch(fetchTenantById(id))
    }
  }, [isEdit, id, tenant, dispatch])

  useEffect(() => {
    if (isEdit && tenant) {
      reset({
        name: tenant.name,
        phone: tenant.phone,
        idNumber: tenant.idNumber,
        businessType: tenant.businessType,
        propertyIds: tenant.propertyIds || [],
        status: tenant.status,
      })
    } else if (!isEdit) {
      reset({
        name: '',
        phone: '',
        idNumber: '',
        businessType: '',
        propertyIds: [],
        status: 'active',
      })
    }
  }, [isEdit, tenant, reset])

  const onSubmit = async (data: TenantFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateTenant({ id, data })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Tenant updated successfully',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createTenant(data)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Tenant created successfully',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      navigate('/tenants')
    } catch (error: any) {
      console.error('Error saving tenant:', error)
      // Handle validation errors from backend
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        // Set form errors for specific fields
        Object.keys(validationErrors).forEach((field) => {
          const fieldName = field as keyof TenantFormData
          if (validationErrors[field] && Array.isArray(validationErrors[field])) {
            setError(fieldName, {
              type: 'server',
              message: validationErrors[field][0]
            })
          }
        })
        // Show first error in Swal
        const firstError = Object.values(validationErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: firstError[0],
          })
        }
      } else if (error?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
        })
      } else if (error?.response?.data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response.data.message,
        })
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

  // Get properties with active contracts
  const getPropertiesWithActiveContracts = () => {
    const today = new Date().toISOString().split('T')[0]
    return contracts
      .filter(c => c.status === 'active' && c.endDate >= today)
      .map(c => c.propertyId)
  }

  // Filter out properties that are already leased (unless editing current tenant's properties)
  const getAvailableProperties = () => {
    const leasedPropertyIds = getPropertiesWithActiveContracts()
    const currentTenantPropertyIds = isEdit && tenant ? (tenant.propertyIds || []) : []
    
    return properties.filter(p => {
      // If editing, allow properties already assigned to this tenant
      if (isEdit && currentTenantPropertyIds.includes(p.id)) {
        return true
      }
      // Otherwise, exclude properties with active contracts
      return !leasedPropertyIds.includes(p.id)
    })
  }

  const availableProperties = getAvailableProperties()

  const propertyOptions = [
    { value: '', label: 'Select Property' },
    ...availableProperties.map(p => ({
      value: p.id,
      label: p.locationId 
        ? `${p.name} - ${getLocationName(p.locationId)}`
        : p.name,
    })),
  ]

  // Show warning if some properties are filtered out
  const leasedProperties = properties.filter(p => {
    const leasedPropertyIds = getPropertiesWithActiveContracts()
    const currentTenantPropertyIds = isEdit && tenant ? (tenant.propertyIds || []) : []
    return leasedPropertyIds.includes(p.id) && !currentTenantPropertyIds.includes(p.id)
  })

  const businessTypeOptions = [
    { value: '', label: 'Select Business Type' },
    ...businessTypes.map(bt => ({
      value: bt.name,
      label: bt.name,
    })),
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'ended', label: 'Ended' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tenants">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Tenants
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Tenant' : 'Add New Tenant'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update tenant information' : 'Enter tenant details and assign property'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Tenant Information" subtitle="Fill in the details below">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" name="name" required error={errors.name?.message}>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Ahmed Hassan"
              />
            </FormField>

            <FormField label="Phone Number" name="phone" required error={errors.phone?.message}>
              <Input
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="e.g., +1-555-0123"
              />
            </FormField>

            <FormField label="ID/Passport Number" name="idNumber" required error={errors.idNumber?.message}>
              <Input
                {...register('idNumber', { required: 'ID number is required' })}
                placeholder="e.g., ID123456789"
              />
            </FormField>

            <FormField label="Business Type" name="businessType" required error={errors.businessType?.message}>
              <Controller
                name="businessType"
                control={control}
                rules={{ required: 'Business type is required' }}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={businessTypeOptions}
                    placeholder="Select business type"
                  />
                )}
              />
            </FormField>

            <FormField label="Assign Properties" name="propertyIds" required error={errors.propertyIds?.message}>
              {leasedProperties.length > 0 && (
                <Alert variant="warning" className="mb-2" title={`${leasedProperties.length} propert${leasedProperties.length === 1 ? 'y is' : 'ies are'} currently leased:`}>
                  <ul className="mt-1 list-disc list-inside">
                    {leasedProperties.map(p => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              <Controller
                name="propertyIds"
                control={control}
                rules={{ required: 'At least one property must be selected' }}
                render={({ field }) => (
                  <MultiSelect
                    name={field.name}
                    value={field.value || []}
                    onChange={field.onChange}
                    options={propertyOptions.filter(opt => opt.value !== '')}
                    placeholder="Select properties"
                  />
                )}
              />
            </FormField>

            <FormField label="Status" name="status" required error={errors.status?.message}>
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
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Tenant' : 'Add Tenant'}
            </Button>
            <Link to="/tenants">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}