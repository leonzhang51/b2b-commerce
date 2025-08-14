import { useState } from 'react'
import {
  Activity,
  BarChart3,
  Building2,
  Download,
  Filter,
  FolderTree,
  Package,
  Search,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdminDashboardProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalCompanies: number
  totalProducts: number
  recentActions: number
  deletedItems: number
}

// Mock stats - in real app, these would come from API
const mockStats: DashboardStats = {
  totalUsers: 156,
  activeUsers: 142,
  totalCompanies: 23,
  totalProducts: 1247,
  recentActions: 89,
  deletedItems: 14,
}

const adminSections = [
  {
    id: 'overview',
    name: 'Overview',
    icon: BarChart3,
    description: 'Dashboard overview and statistics',
  },
  {
    id: 'users',
    name: 'User Management',
    icon: Users,
    description: 'Manage users, roles, and permissions',
  },
  {
    id: 'companies',
    name: 'Companies',
    icon: Building2,
    description: 'Manage company accounts and settings',
  },
  {
    id: 'products',
    name: 'Products',
    icon: Package,
    description: 'Product catalog and inventory management',
  },
  {
    id: 'categories',
    name: 'Categories',
    icon: FolderTree,
    description: 'Product category hierarchy management',
  },
  {
    id: 'audit',
    name: 'Audit Logs',
    icon: Activity,
    description: 'System activity and security logs',
  },
  {
    id: 'deleted',
    name: 'Deleted Items',
    icon: Trash2,
    description: 'Manage soft-deleted entities',
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Security settings and access control',
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: Settings,
    description: 'Application configuration and settings',
  },
]

export function AdminDashboard({
  activeSection,
  onSectionChange,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredSections = adminSections.filter(
    (section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'blue',
  }: {
    title: string
    value: number | string
    subtitle?: string
    icon: any
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    }

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your B2B commerce platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search admin sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Overview Stats (only show on overview section) */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total Users"
            value={mockStats.totalUsers}
            subtitle={`${mockStats.activeUsers} active`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Companies"
            value={mockStats.totalCompanies}
            icon={Building2}
            color="green"
          />
          <StatCard
            title="Products"
            value={mockStats.totalProducts}
            icon={Package}
            color="purple"
          />
          <StatCard
            title="Recent Actions"
            value={mockStats.recentActions}
            subtitle="Last 24 hours"
            icon={Activity}
            color="yellow"
          />
          <StatCard
            title="Deleted Items"
            value={mockStats.deletedItems}
            subtitle="Awaiting cleanup"
            icon={Trash2}
            color="red"
          />
          <StatCard
            title="System Health"
            value="Good"
            subtitle="All systems operational"
            icon={Shield}
            color="green"
          />
        </div>
      )}

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`p-6 rounded-lg border-2 text-left transition-all duration-200 ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      isActive ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {section.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isActive ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      {activeSection === 'overview' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => onSectionChange('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Add New User
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => onSectionChange('companies')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Add Company
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => onSectionChange('products')}
            >
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => onSectionChange('audit')}
            >
              <Activity className="h-4 w-4 mr-2" />
              View Audit Logs
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
