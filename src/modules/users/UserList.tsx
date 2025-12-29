import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { fetchUsers, deleteUser, resetUserPassword, toggleUserStatus } from './usersSlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { User, Edit, Trash2, Plus, Key, Power, PowerOff } from 'lucide-react'
import { format } from 'date-fns'
import Swal from 'sweetalert2'

export default function UserList() {
  const dispatch = useDispatch<AppDispatch>()
  const { users, pagination, loading } = useSelector((state: RootState) => state.users)
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, perPage: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: userToDelete 
        ? `You are about to delete user "${userToDelete.name}". This action cannot be undone!`
        : 'You are about to delete this user. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUser(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
        // Refresh the list
        dispatch(fetchUsers({ page: currentPage, perPage: itemsPerPage }))
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete user. Please try again.',
        })
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleResetPassword = async (id: string) => {
    const userToReset = users.find(u => u.id === id)
    const result = await Swal.fire({
      title: 'Reset Password?',
      text: userToReset 
        ? `Reset password for "${userToReset.name}" to default password (kala@excel)?`
        : 'Reset password to default password (kala@excel)?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reset it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(resetUserPassword(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Password Reset!',
          text: 'User password has been reset to default password (kala@excel).',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to reset password. Please try again.',
        })
      }
    }
  }

  const handleToggleStatus = async (id: string) => {
    const userToToggle = users.find(u => u.id === id)
    const newStatus = userToToggle?.status === 'active' ? 'inactive' : 'active'
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate'
    
    const result = await Swal.fire({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} User?`,
      text: userToToggle 
        ? `Are you sure you want to ${actionText} "${userToToggle.name}"?`
        : `Are you sure you want to ${actionText} this user?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'active' ? '#10b981' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText}!`,
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(toggleUserStatus(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `User has been ${actionText}d successfully.`,
          timer: 2000,
          showConfirmButton: false,
        })
        // Refresh the list
        dispatch(fetchUsers({ page: currentPage, perPage: itemsPerPage }))
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || `Failed to ${actionText} user. Please try again.`,
        })
      }
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value: string | undefined) => (
        <span className="text-gray-900">{value ? format(new Date(value), 'MMM dd, yyyy') : 'Never'}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Link to={`/users/${record.id}/edit`}>
            <Button 
              size="sm" 
              variant="secondary" 
              icon={<Edit className="h-4 w-4" />}
              className="p-2"
              title="Edit user"
            >
              <span className="sr-only">Edit</span>
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Button 
                size="sm" 
                variant="secondary" 
                icon={<Key className="h-4 w-4" />}
                onClick={() => handleResetPassword(record.id)}
                title="Reset password to default"
                className="p-2"
              >
                <span className="sr-only">Reset Password</span>
              </Button>
              <Button 
                size="sm" 
                variant={record.status === 'active' ? 'secondary' : 'primary'}
                icon={record.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                onClick={() => handleToggleStatus(record.id)}
                title={record.status === 'active' ? 'Deactivate user' : 'Activate user'}
                className="p-2"
              >
                <span className="sr-only">{record.status === 'active' ? 'Deactivate' : 'Activate'}</span>
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDelete(record.id)}
                title="Delete user"
                className="p-2"
              >
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ]

  const activeUsers = users.filter(u => u.status === 'active')
  const adminUsers = users.filter(u => u.role === 'admin')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <Link to="/users/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Add User
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{activeUsers.length}</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{adminUsers.length}</p>
            <p className="text-sm text-gray-600">Administrators</p>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card title="Users List" subtitle="All system users">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={users}
              emptyMessage="No users found. Add your first user to get started."
              showSerialNumber
              serialNumberStart={pagination ? (pagination.currentPage - 1) * pagination.perPage + 1 : 1}
            />
            {pagination && pagination.total > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.lastPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.perPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

