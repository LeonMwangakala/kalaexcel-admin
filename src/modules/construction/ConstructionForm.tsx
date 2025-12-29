import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { RootState, AppDispatch } from '../../store'
import { createProject, updateProject, fetchProjectById } from './constructionSlice'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Form, FormField, Input, Textarea } from '../../components/common/Form'
import { ConstructionProject } from '../../types'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

interface ProjectFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  budget: number
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
}

export default function ConstructionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { projects, loading } = useSelector((state: RootState) => state.construction)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEdit = Boolean(id)
  const project = isEdit ? projects.find(p => p.id === id) : null

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      budget: 0,
      status: 'planning',
      progress: 0,
    },
  })

  useEffect(() => {
    if (isEdit && id && !project) {
      dispatch(fetchProjectById(id))
    }
  }, [isEdit, id, project, dispatch])

  useEffect(() => {
    if (isEdit && project) {
      reset({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate || '',
        budget: project.budget,
        status: project.status,
        progress: project.progress,
      })
    } else if (!isEdit) {
      reset({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: 0,
        status: 'planning',
        progress: 0,
      })
    }
  }, [isEdit, project, reset])

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await dispatch(updateProject({ id, data: { ...data, endDate: data.endDate || undefined } })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Construction project has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await dispatch(createProject({ ...data, endDate: data.endDate || undefined, totalSpent: 0 })).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Construction project has been created successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      navigate('/construction')
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to save construction project. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/construction">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Project' : 'New Construction Project'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update project details' : 'Create a new construction project'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card title="Project Information" subtitle="Fill in the project details">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Project Name" name="name" required error={errors.name?.message}>
              <Input
                {...register('name', { required: 'Project name is required' })}
                placeholder="e.g., New Shopping Complex Phase 1"
              />
            </FormField>

            <FormField label="Project Status" name="status" required error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={statusOptions}
                    placeholder="Select project status..."
                    isSearchable={false}
                    onChange={(option) => {
                      field.onChange(option?.value || '')
                    }}
                    value={statusOptions.find(opt => opt.value === field.value) || null}
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

            <FormField label="End Date" name="endDate" error={errors.endDate?.message}>
              <Input
                type="date"
                {...register('endDate')}
                placeholder="Optional - leave blank if ongoing"
              />
            </FormField>

            <FormField label="Project Budget (TZS)" name="budget" required error={errors.budget?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('budget', { 
                  required: 'Budget is required',
                  min: { value: 0, message: 'Budget must be positive' }
                })}
                placeholder="e.g., 500000"
              />
            </FormField>

            <FormField label="Project Progress (%)" name="progress" required error={errors.progress?.message}>
              <Input
                type="number"
                min="0"
                max="100"
                {...register('progress', { 
                  required: 'Progress is required',
                  min: { value: 0, message: 'Progress must be 0-100' },
                  max: { value: 100, message: 'Progress must be 0-100' }
                })}
                placeholder="e.g., 65"
              />
            </FormField>
          </div>

          <FormField label="Project Description" name="description" required error={errors.description?.message}>
            <Textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe the construction project scope and objectives..."
              rows={4}
            />
          </FormField>

          <div className="flex items-center space-x-4">
            <Button type="submit" loading={isSubmitting || loading}>
              {isEdit ? 'Update Project' : 'Create Project'}
            </Button>
            <Link to="/construction">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}