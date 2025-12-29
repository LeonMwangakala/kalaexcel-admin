import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function Card({ children, className, title, subtitle, actions }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: ReactNode
}

export function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={clsx(
                'text-sm font-medium',
                trend.isPositive ? 'text-success-600' : 'text-danger-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}