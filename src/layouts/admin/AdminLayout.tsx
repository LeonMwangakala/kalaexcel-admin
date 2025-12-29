import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Home, 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle, 
  HardHat, 
  CreditCard,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { IoWaterOutline } from 'react-icons/io5'
import { PiToilet } from 'react-icons/pi'
import { GiMoneyStack, GiTap } from 'react-icons/gi'
import clsx from 'clsx'
import logo from '../../assets/logo.png'
import { logout } from '../../modules/auth/authSlice'
import { AppDispatch, RootState } from '../../store'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Rent Payments', href: '/rent', icon: GiMoneyStack },
  { name: 'Construction', href: '/construction', icon: HardHat },
  { name: 'Banking', href: '/banking', icon: CreditCard },
  { name: 'Public Toilet', href: '/toilet', icon: PiToilet },
  { name: 'Water Supply', href: '/water-supply/customers', icon: IoWaterOutline },
  { name: 'Water Well', href: '/water-well', icon: GiTap },
  { name: 'Users', href: '/users', icon: UserCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Kala Excel Logo" className="h-8 w-8 object-contain" />
            <h1 className="text-xl font-bold text-gray-900">Kala Excel Co. Ltd</h1>
          </div>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Real Estate Management System</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}