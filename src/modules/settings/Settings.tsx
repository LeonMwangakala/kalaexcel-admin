import { useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { User, Building2, Briefcase, Tag, Hammer, MapPin, Store } from 'lucide-react'
import ProfileSettings from './ProfileSettings'
import PropertyTypesSettings from './PropertyTypesSettings'
import BusinessTypesSettings from './BusinessTypesSettings'
import TransactionCategoriesSettings from './TransactionCategoriesSettings'
import ConstructionMaterialsSettings from './ConstructionMaterialsSettings'
import LocationsSettings from './LocationsSettings'
import VendorsSettings from './VendorsSettings'

type SettingsTab = 'profile' | 'property-types' | 'business-types' | 'transaction-categories' | 'construction-materials' | 'locations' | 'vendors'

const tabs = [
  { id: 'profile' as SettingsTab, name: 'Profile', icon: User },
  { id: 'property-types' as SettingsTab, name: 'Property Types', icon: Building2 },
  { id: 'locations' as SettingsTab, name: 'Locations', icon: MapPin },
  { id: 'business-types' as SettingsTab, name: 'Business Types', icon: Briefcase },
  { id: 'transaction-categories' as SettingsTab, name: 'Transaction Categories', icon: Tag },
  { id: 'construction-materials' as SettingsTab, name: 'Construction Materials', icon: Hammer },
  { id: 'vendors' as SettingsTab, name: 'Vendors', icon: Store },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'property-types':
        return <PropertyTypesSettings />
      case 'locations':
        return <LocationsSettings />
      case 'business-types':
        return <BusinessTypesSettings />
      case 'transaction-categories':
        return <TransactionCategoriesSettings />
      case 'construction-materials':
        return <ConstructionMaterialsSettings />
      case 'vendors':
        return <VendorsSettings />
      default:
        return <ProfileSettings />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system settings and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

