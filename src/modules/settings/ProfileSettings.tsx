import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { RootState, AppDispatch } from '../../store'
import { updateProfile, createProfile, fetchProfile, updatePassword } from './settingsSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input } from '../../components/common/Form'
import { Profile } from '../../types'
import Swal from 'sweetalert2'
import { Edit } from 'lucide-react'

interface ProfileFormData {
  companyName: string
  email: string
  phone: string
  address: string
  taxId?: string
  registrationNumber?: string
}

interface PasswordFormData {
  currentPassword: string
  password: string
  passwordConfirmation: string
}

export default function ProfileSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const { profile, loading } = useSelector((state: RootState) => state.settings)
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const isAdmin = currentUser?.role === 'admin'

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      companyName: profile?.companyName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      taxId: profile?.taxId || '',
      registrationNumber: profile?.registrationNumber || '',
    },
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  useEffect(() => {
    if (isAdmin && !profile) {
      dispatch(fetchProfile())
    }
  }, [dispatch, profile, isAdmin])

  // If no profile exists, show form in edit mode
  useEffect(() => {
    if (isAdmin && profile === null && !loading) {
      setIsEditing(true)
    }
  }, [isAdmin, profile, loading])

  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        taxId: profile.taxId || '',
        registrationNumber: profile.registrationNumber || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      if (!profile) {
        // Create profile if it doesn't exist
        await dispatch(createProfile({
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          taxId: data.taxId,
          registrationNumber: data.registrationNumber,
        })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile created successfully!',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        // Update existing profile
        await dispatch(updateProfile(data)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile updated successfully!',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      // Refetch profile to get the latest data
      await dispatch(fetchProfile())
      setIsEditing(false) // Switch back to view mode
    } catch (error: any) {
      console.error('Error saving profile:', error)
      const errorMessage = error?.message || error || 'Failed to save profile. Please try again.'
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to current profile values
    if (profile) {
      reset({
        companyName: profile.companyName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        taxId: profile.taxId || '',
        registrationNumber: profile.registrationNumber || '',
      })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true)
    try {
      await dispatch(updatePassword(data)).unwrap()
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password updated successfully!',
        timer: 2000,
        showConfirmButton: false,
      })
      resetPassword()
    } catch (error: any) {
      console.error('Error updating password:', error)
      const errorMessage = error?.message || error || 'Failed to update password. Please try again.'
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading && !profile && isAdmin) {
    return (
      <Card title="Company Profile" subtitle="Update company information">
        <div className="text-center py-8">Loading profile...</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card 
          title="Company Profile" 
          subtitle={isEditing ? "Update company information" : "Company information"}
          actions={
            !isEditing && (
              <Button 
                variant="secondary" 
                icon={<Edit className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )
          }
        >
          {isEditing ? (
            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Company Name" name="companyName" required error={errors.companyName?.message}>
                  <Input
                    {...register('companyName', { required: 'Company name is required' })}
                    placeholder="e.g., Kala Excel Co., Ltd"
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
                    placeholder="e.g., info@kalaexcel.com"
                  />
                </FormField>

                <FormField label="Phone" name="phone" required error={errors.phone?.message}>
                  <Input
                    {...register('phone', { required: 'Phone number is required' })}
                    placeholder="e.g., +255-123-456-789"
                  />
                </FormField>

                <FormField label="Address" name="address" required error={errors.address?.message}>
                  <Input
                    {...register('address', { required: 'Address is required' })}
                    placeholder="e.g., Dar es Salaam, Tanzania"
                  />
                </FormField>

                <FormField label="Tax ID (TIN)" name="taxId" error={errors.taxId?.message}>
                  <Input
                    {...register('taxId')}
                    placeholder="e.g., TIN-123456789"
                  />
                </FormField>

                <FormField label="Registration Number" name="registrationNumber" error={errors.registrationNumber?.message}>
                  <Input
                    {...register('registrationNumber')}
                    placeholder="e.g., REG-2024-001"
                  />
                </FormField>
              </div>

              <div className="flex items-center space-x-4">
                <Button type="submit" loading={isSubmitting || loading}>
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <div className="space-y-6">
              {profile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <p className="text-gray-900">{profile.companyName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{profile.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{profile.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900">{profile.address || '-'}</p>
                  </div>
                  {profile.taxId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID (TIN)</label>
                      <p className="text-gray-900">{profile.taxId}</p>
                    </div>
                  )}
                  {profile.registrationNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                      <p className="text-gray-900">{profile.registrationNumber}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No profile information available. Click "Edit" to create one.
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card title="Change Password" subtitle="Update your account password">
        <Form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Current Password" name="currentPassword" required error={passwordErrors.currentPassword?.message}>
              <Input
                type="password"
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                placeholder="Enter your current password"
              />
            </FormField>

            <FormField label="New Password" name="password" required error={passwordErrors.password?.message}>
              <Input
                type="password"
                {...registerPassword('password', { 
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                placeholder="Enter your new password"
              />
            </FormField>

            <FormField label="Confirm New Password" name="passwordConfirmation" required error={passwordErrors.passwordConfirmation?.message}>
              <Input
                type="password"
                {...registerPassword('passwordConfirmation', { 
                  required: 'Please confirm your new password',
                  validate: (value, formValues) => {
                    return value === formValues.password || 'Passwords do not match'
                  }
                })}
                placeholder="Confirm your new password"
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isUpdatingPassword}>
              Update Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

