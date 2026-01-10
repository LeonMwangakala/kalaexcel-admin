import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { deleteContract, fetchContracts, fetchContractStats } from './contractsSlice'
import { fetchTenants } from '../tenants/tenantsSlice'
import { fetchProperties } from '../property/propertySlice'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { FileText, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import Swal from 'sweetalert2'

export default function ContractList() {
  const dispatch = useDispatch<AppDispatch>()
  const { contracts, pagination, stats, loading } = useSelector((state: RootState) => state.contracts)
  const tenants = useSelector((state: RootState) => state.tenants.tenants)
  const properties = useSelector((state: RootState) => state.properties.properties)
  const { user } = useSelector((state: RootState) => state.auth)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    dispatch(fetchContracts({ page: currentPage, perPage: itemsPerPage }))
    dispatch(fetchContractStats()) // Fetch summary stats from backend
    // Tenant and property data are nested in contract response, but fetch for fallback (for dropdowns/lookups only)
    dispatch(fetchTenants({ page: 1, perPage: 1000 }))
    dispatch(fetchProperties({ page: 1, perPage: 1000 }))
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

  const getTenantName = (tenantId: string, contract?: any) => {
    // First try to get from contract's nested tenant object (from API)
    if (contract?.tenant?.name) {
      return contract.tenant.name
    }
    // Fallback to Redux state
    const tenant = tenants.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown Tenant'
  }

  const getPropertyName = (propertyId: string, contract?: any) => {
    // First try to get from contract's nested property object (from API)
    if (contract?.property?.name) {
      return contract.property.name
    }
    // Fallback to Redux state
    const property = properties.find(p => p.id === propertyId)
    return property?.name || 'Unknown Property'
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleDelete = async (contractId: string, contractNumber?: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: contractNumber 
        ? `You are about to delete contract ${contractNumber}. This action cannot be undone!`
        : 'You are about to delete this contract. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteContract(contractId)).unwrap()
        
        // Calculate page to fetch after deletion
        const newTotal = (pagination?.total || 1) - 1
        const itemsOnCurrentPage = contracts.length
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
        
        // Refresh the contracts list with updated page and stats
        dispatch(fetchContracts({ page: pageToFetch, perPage: itemsPerPage }))
        dispatch(fetchContractStats())
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Contract has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete contract. Please try again.',
        })
      }
    }
  }

  const columns = [
    {
      key: 'contractNumber',
      title: 'Contract Number',
      render: (value: string) => (
        <span className="font-mono font-semibold text-primary-600">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'tenantId',
      title: 'Tenant',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{getTenantName(value, record)}</span>
        </div>
      ),
    },
    {
      key: 'propertyId',
      title: 'Property',
      render: (value: string, record: any) => (
        <span className="text-gray-900">{getPropertyName(value, record)}</span>
      ),
    },
    {
      key: 'rentAmount',
      title: 'Monthly Rent',
      render: (value: number) => `TZS ${value.toLocaleString()}`,
    },
    {
      key: 'startDate',
      title: 'Start Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'endDate',
      title: 'End Date',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-success-100 text-success-800' :
          value === 'expired' ? 'bg-gray-100 text-gray-800' :
          'bg-danger-100 text-danger-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/contracts/${record.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          {isAdmin && (
            <Button 
              size="sm" 
              variant="danger" 
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => handleDelete(record.id, record.contractNumber)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-1">Manage rental agreements and contracts</p>
        </div>
        <Link to="/contracts/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Create Contract
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            <p className="text-sm text-gray-600">Total Contracts</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{stats?.active || 0}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-500">{stats?.expired || 0}</p>
            <p className="text-sm text-gray-600">Expired</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">TZS {Number(stats?.totalMonthlyRent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-600">Total Monthly Value</p>
          </div>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card title="Contracts List" subtitle="All rental agreements">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={contracts}
              emptyMessage="No contracts found. Create your first contract to get started."
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