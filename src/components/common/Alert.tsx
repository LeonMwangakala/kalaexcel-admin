import { ReactNode } from 'react'
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    text: 'text-blue-700',
    iconComponent: Info,
  },
  success: {
    container: 'bg-success-50 border-success-200',
    icon: 'text-success-600',
    title: 'text-success-800',
    text: 'text-success-700',
    iconComponent: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    text: 'text-yellow-700',
    iconComponent: AlertTriangle,
  },
  error: {
    container: 'bg-danger-50 border-danger-200',
    icon: 'text-danger-600',
    title: 'text-danger-800',
    text: 'text-danger-700',
    iconComponent: AlertCircle,
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const styles = variantStyles[variant]
  const Icon = styles.iconComponent

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border',
        styles.container,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', styles.icon)} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium mb-1', styles.title)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm', styles.text)}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  styles.icon,
                  variant === 'info' && 'hover:bg-blue-100 focus:ring-blue-600',
                  variant === 'success' && 'hover:bg-success-100 focus:ring-success-600',
                  variant === 'warning' && 'hover:bg-yellow-100 focus:ring-yellow-600',
                  variant === 'error' && 'hover:bg-danger-100 focus:ring-danger-600'
                )}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

