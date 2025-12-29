import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import Swal from 'sweetalert2'
import { Card } from '../../components/common/Card'
import { Table } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { Button } from '../../components/common/Button'
import { Building2, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { fetchProperties, deleteProperty } from './propertySlice'
import { fetchPropertyTypes, fetchLocations } from '../settings/settingsSlice'

export default function PropertyList() {
  const dispatch = useDispatch<AppDispatch>()
  const { properties, pagination, loading, error } = useSelector((state: RootState) => state.properties)
  const { user } = useSelector((state: RootState) => state.auth)
  const tenants = useSelector((state: RootState) => state.tenants.tenants)
  const propertyTypes = useSelector((state: RootState) => state.settings.propertyTypes)
  const locations = useSelector((state: RootState) => state.settings.locations)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    dispatch(fetchProperties({ page: currentPage, perPage: itemsPerPage }))
    // Property type, location, and tenant data are nested in property response, but fetch for fallback
    dispatch(fetchPropertyTypes())
    dispatch(fetchLocations())
  }, [dispatch, currentPage, itemsPerPage])

  const handleDelete = async (id: string) => {
    const property = properties.find(p => p.id === id)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: property 
        ? `You are about to delete property "${property.name}". This action cannot be undone!`
        : 'You are about to delete this property. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteProperty(id)).unwrap()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Property has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        })
        // Refresh the list
        dispatch(fetchProperties({ page: currentPage, perPage: itemsPerPage }))
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'Failed to delete property. Please try again.',
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

  const getTenantsForProperty = (propertyId: string, property?: any) => {
    // First try to get from property's nested tenants array (from API)
    if (property?.tenants && property.tenants.length > 0) {
      if (property.tenants.length === 1) return property.tenants[0].name
      return `${property.tenants.length} tenants`
    }
    // Fallback to Redux state
    const propertyTenants = tenants.filter(t => t.propertyIds?.includes(propertyId))
    if (propertyTenants.length === 0) return 'No tenant'
    if (propertyTenants.length === 1) return propertyTenants[0].name
    return `${propertyTenants.length} tenants`
  }

  const getPropertyTypeName = (propertyTypeId: string | undefined, property?: any) => {
    // First try to get from property's nested propertyType object (from API)
    if (property?.propertyType?.name) {
      return property.propertyType.name
    }
    // Fallback to Redux state
    if (!propertyTypeId) return '-'
    const propertyType = propertyTypes.find(pt => pt.id === propertyTypeId)
    return propertyType?.name || 'Unknown'
  }

  const getLocationName = (locationId: string | undefined, property?: any) => {
    // First try to get from property's nested location object (from API)
    if (property?.location?.name) {
      return property.location.name
    }
    // Fallback to Redux state
    if (!locationId) return '-'
    const location = locations.find(l => l.id === locationId)
    return location?.name || 'Unknown'
  }

  const columns = [
    {
      key: 'name',
      title: 'Property Name',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'propertyTypeId',
      title: 'Property Type',
      render: (value: string | undefined, record: any) => (
        <span className="text-gray-900">{getPropertyTypeName(value, record)}</span>
      ),
    },
    {
      key: 'locationId',
      title: 'Location',
      render: (value: string | undefined, record: any) => (
        <span className="text-gray-900">{getLocationName(value, record)}</span>
      ),
    },
    {
      key: 'size',
      title: 'Size',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'occupied' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'monthlyRent',
      title: 'Monthly Rent',
      render: (value: number) => `TZS ${value.toLocaleString()}`,
    },
    {
      key: 'id',
      title: 'Tenant(s)',
      render: (_: any, record: any) => (
        <span className="text-gray-900">{getTenantsForProperty(record.id, record)}</span>
      ),
    },
    {
      key: 'dateAdded',
      title: 'Date Added',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Link to={`/properties/${record.id}/edit`}>
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">Manage your real estate properties</p>
        </div>
        <Link to="/properties/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Add Property
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              {properties.filter(p => p.status === 'occupied').length}
            </p>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-500">
              {properties.filter(p => p.status === 'available').length}
            </p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Properties Table */}
      <Card title="Properties List" subtitle="All properties in your portfolio">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={properties}
              emptyMessage="No properties found. Add your first property to get started."
              showSerialNumber
              serialNumberStart={
                pagination?.currentPage && pagination?.perPage
                  ? (pagination.currentPage - 1) * pagination.perPage + 1
                  : 1
              }
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