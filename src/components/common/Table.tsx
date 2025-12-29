import { ReactNode } from 'react'
import clsx from 'clsx'

interface Column<T> {
  key: keyof T
  title: string
  render?: (value: any, record: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  showSerialNumber?: boolean
  serialNumberStart?: number
}

export function Table<T extends Record<string, any>>({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'No data available',
  className,
  showSerialNumber = false,
  serialNumberStart = 1,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showSerialNumber && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showSerialNumber ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {showSerialNumber && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {serialNumberStart + index}
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', column.className)}
                    >
                      {column.render 
                        ? column.render(record[column.key], record)
                        : String(record[column.key] ?? '')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}