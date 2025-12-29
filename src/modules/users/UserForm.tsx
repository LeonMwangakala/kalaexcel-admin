import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createUser, updateUser, fetchUserById } from './usersSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { User } from '../../types'
import { ArrowLeft } from 'lucide-react'

interface UserFormData {
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'operator' | 'cashier'
  status: 'active' | 'inactive'
  password?: string
}

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading } = useSelector((state: RootState) => state.users)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const user = isEdit ? users.find(u => u.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<UserFormData>({
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    } : {
      status: 'active',
      role: 'operator',
      password: 'kala@excel',
    },
  })

  useEffect(() => {
    if (isEdit && id && !user) {
      dispatch(fetchUserById(id))
    }
  }, [isEdit, id, user, dispatch])

  useEffect(() => {
    if (isEdit && user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      })
    } else if (!isEdit) {
      reset({
        name: '',
        email: '',
        phone: '',
        role: 'operator',
        status: 'active',
        password: 'kala@excel',
      })
    }
  }, [isEdit, user, reset])

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateUser({ id, data })).unwrap()
      } else {
        // Always use default password when creating a user
        const userData = {
          ...data,
          password: 'kala@excel',
        }
        await dispatch(createUser(userData)).unwrap()
      }
      navigate('/users')
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'operator', label: 'Operator' },
    { value: 'cashier', label: 'Cashier' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/users">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update user information' : 'Enter user details'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="User Information" subtitle="Fill in the details below">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" name="name" required error={errors.name?.message}>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., John Doe"
              />
            </FormField>

            <FormField label="Email" name="email" required error={errors.email?.message}>
              <Input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="e.g., john@kalaexcel.com"
              />
            </FormField>

            <FormField label="Phone" name="phone" required error={errors.phone?.message}>
              <Input
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="e.g., +255-123-456-789"
              />
            </FormField>

            <FormField label="Role" name="role" required error={errors.role?.message}>
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={roleOptions}
                    placeholder="Select a role..."
                    isSearchable={false}
                    onChange={(option) => {
                      field.onChange(option?.value || '')
                    }}
                    value={roleOptions.find(opt => opt.value === field.value) || null}
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
                    {...field}
                    options={statusOptions}
                    placeholder="Select status..."
                    isSearchable={false}
                    onChange={(option) => {
                      field.onChange(option?.value || '')
                    }}
                    value={statusOptions.find(opt => opt.value === field.value) || null}
                  />
                )}
              />
            </FormField>

            {!isEdit && (
              <FormField label="Password" name="password" error={errors.password?.message}>
                <Input
                  type="password"
                  {...register('password')}
                  value="kala@excel"
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Default password: kala@excel"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Default password is set to: <span className="font-mono">kala@excel</span>
                </p>
              </FormField>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update User' : 'Add User'}
            </Button>
            <Link to="/users">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

