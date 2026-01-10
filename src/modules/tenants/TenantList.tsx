import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { Users, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { fetchTenants, deleteTenant } from './tenantsSlice'
import { fetchProperties } from '../property/propertySlice'
import { fetchContracts } from '../contracts/contractsSlice'

export default function TenantList() {
  const dispatch = useDispatch<AppDispatch>()
  const { tenants, pagination, loading } = useSelector((state: RootState) => state.tenants)
  const { properties } = useSelector((state: RootState) => state.properties)
  const { contracts } = useSelector((state: RootState) => state.contracts)
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    dispatch(fetchTenants({ page: currentPage, perPage: itemsPerPage }))
    // Properties are nested in tenant response, but fetch for fallback
    dispatch(fetchProperties({ page: 1, perPage: 1000 }))
    // Fetch contracts to get active contract end dates
    dispatch(fetchContracts({ page: 1, perPage: 1000 }))
  }, [dispatch, currentPage, itemsPerPage])

  // Sync local state with Redux pagination state after API response
  useEffect(() => {
    if (pagination) {
      if (pagination.currentPage !== currentPage) {
        setCurrentPage(pagination.currentPage)
      }
      if (pagination.perPage !== itemsPerPage) {
        setItemsPerPage(pagination.perPage)
      }
    }
  }, [pagination?.currentPage, pagination?.perPage])

  const handleDelete = async (id: string) => {
    const tenant = tenants.find(t => t.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: tenant 
        ? `You are about to delete tenant "${tenant.name}". This action cannot be undone!`
        : 'You are about to delete this tenant. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteTenant(id)).unwrap()
        
        // Calculate page to fetch after deletion
        const newTotal = (pagination?.total || 1) - 1
        const itemsOnCurrentPage = tenants.length
        let pageToFetch = currentPage
        
        if (itemsOnCurrentPage === 1 && currentPage > 1) {
          // If this was the last item on the page, go to previous page
          pageToFetch = currentPage - 1
          setCurrentPage(pageToFetch)
        } else if (newTotal > 0) {
          // Calculate the last page after deletion
          const lastPageAfterDelete = Math.ceil(newTotal / itemsPerPage)
          if (currentPage > lastPageAfterDelete) {
            pageToFetch = Math.max(1, lastPageAfterDelete)
            setCurrentPage(pageToFetch)
          }
        } else {
          // No items left, go to page 1
          pageToFetch = 1
          setCurrentPage(1)
        }
        
        // Refresh the list with updated page
        dispatch(fetchTenants({ page: pageToFetch, perPage: itemsPerPage }))
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Tenant has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete tenant. Please try again.',
        })
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const getPropertyNames = (propertyIds: string[] | undefined, tenant?: any) => {
    // First try to get from tenant's nested properties array (from API)
    if (tenant?.properties && tenant.properties.length > 0) {
      return tenant.properties.map((p: any) => p.name).join(', ')
    }
    // Fallback to Redux state
    if (!propertyIds || propertyIds.length === 0) return 'No properties'
    return propertyIds.map(id => {
      const property = properties.find(p => p.id === id)
      return property?.name || 'Unknown'
    }).join(', ')
  }

  const getActiveContractEndDate = (tenantId: string) => {
    const today = new Date().toISOString().split('T')[0]
    // Find active contract for this tenant
    const activeContract = contracts.find(
      c => c.tenantId === tenantId && 
           c.status === 'active' && 
           c.endDate >= today
    )
    return activeContract?.endDate || null
  }

  const columns = [
    {
      key: 'name',
      title: 'Tenant Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
    },
    {
      key: 'businessType',
      title: 'Business Type',
    },
    {
      key: 'propertyIds',
      title: 'Properties',
      render: (value: string[] | undefined, record: any) => (
        <span className="text-gray-900">{getPropertyNames(value, record)}</span>
      ),
    },
    {
      key: 'contractEndDate',
      title: 'Contract End',
      render: (_: any, record: any) => {
        const endDate = getActiveContractEndDate(record.id)
        return endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'N/A'
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-success-100 text-success-800' :
          value === 'pending_payment' ? 'bg-warning-100 text-warning-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/tenants/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          {isAdmin && (
            <Button 
              size="sm" 
              variant="danger" 
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ]

  const activeTenants = tenants.filter(t => t.status === 'active').length
  const pendingPaymentTenants = tenants.filter(t => t.status === 'pending_payment').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">Manage your tenants and their contracts</p>
        </div>
        <Link to="/tenants/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Add Tenant
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{pagination?.total || tenants.length}</p>
            <p className="text-sm text-gray-600">Total Tenants</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{activeTenants}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">{pendingPaymentTenants}</p>
            <p className="text-sm text-gray-600">Pending Payment</p>
          </div>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card title="Tenants List" subtitle="All tenants in your properties">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tenants...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={tenants}
              emptyMessage="No tenants found. Add your first tenant to get started."
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