import { ReactNode, forwardRef } from 'react'
import { useForm, FieldValues, UseFormProps, SubmitHandler, Controller } from 'react-hook-form'
import Select, { StylesConfig, GroupBase } from 'react-select'

interface FormProps<T extends FieldValues> extends UseFormProps<T> {
  children: ReactNode
  onSubmit: SubmitHandler<T>
  className?: string
}

export function Form<T extends FieldValues>({ 
  children, 
  onSubmit, 
  className,
  ...formProps 
}: FormProps<T>) {
  const { handleSubmit, ...methods } = useForm(formProps)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  children: ReactNode
}

export function FormField({ label, name, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ name, className = '', ...props }, ref) => {
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  return (
    <input
      ref={ref}
      id={name}
      name={name}
      className={className ? `${baseClasses} ${className}` : baseClasses}
      {...props}
    />
  )
})

Input.displayName = 'Input'

// Custom styles for react-select to match our design
const selectStyles: StylesConfig<any, false, GroupBase<any>> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '42px',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#eff6ff'
      : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    '&:active': {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#1f2937',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#eff6ff',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#1f2937',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#1f2937',
    '&:hover': {
      backgroundColor: '#dbeafe',
      color: '#1f2937',
    },
  }),
}

interface SelectProps {
  name: string
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
  isDisabled?: boolean
}

export const SelectComponent = forwardRef<any, SelectProps>(({ 
  name, 
  options, 
  value, 
  onChange, 
  className = '',
  placeholder = 'Select...',
  isDisabled = false,
  ...props 
}, ref) => {
  const selectOptions = options.map(opt => ({
    value: opt.value,
    label: opt.label,
  }))

  const selectedOption = selectOptions.find(opt => opt.value === value) || null

  const handleChange = (selected: any) => {
    if (onChange) {
      onChange(selected ? selected.value : '')
    }
  }

  return (
    <Select
      ref={ref}
      name={name}
      options={selectOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable
      styles={selectStyles}
      className={className}
      {...props}
    />
  )
})

SelectComponent.displayName = 'Select'

// Export the component for direct use with Controller
export { SelectComponent as Select }

interface MultiSelectProps {
  name: string
  options: Array<{ value: string; label: string }>
  value?: string[]
  onChange?: (value: string[]) => void
  className?: string
  placeholder?: string
  isDisabled?: boolean
}

export const MultiSelectComponent = forwardRef<any, MultiSelectProps>(({ 
  name, 
  options, 
  value = [], 
  onChange, 
  className = '',
  placeholder = 'Select...',
  isDisabled = false,
  ...props 
}, ref) => {
  const selectOptions = options.map(opt => ({
    value: opt.value,
    label: opt.label,
  }))

  const selectedOptions = selectOptions.filter(opt => value.includes(opt.value))

  const handleChange = (selected: any) => {
    if (onChange) {
      onChange(selected ? selected.map((opt: any) => opt.value) : [])
    }
  }

  return (
    <Select
      ref={ref}
      name={name}
      options={selectOptions}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isMulti
      isClearable
      styles={selectStyles}
      className={className}
      {...props}
    />
  )
})

MultiSelectComponent.displayName = 'MultiSelect'

// Export the component for direct use with Controller
export { MultiSelectComponent as MultiSelect }

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ name, className, rows = 3, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      id={name}
      name={name}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className || ''}`}
      rows={rows}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'