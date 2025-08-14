import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuditLogger } from '@/hooks/useAuditLog'
import {
  useIsSessionWarningVisible,
  useRefreshToken,
  useSecurityStore,
  useSendEmailVerification,
} from '@/store/securityStore'
import { Button } from '@/components/ui/button'
import { securityConfig } from '@/config/security'

export function SecurityDashboard() {
  const { user } = useAuth()
  const { createAuditLog } = useAuditLogger()
  const securityContext = useSecurityStore((state) => state)
  const isSessionWarningVisible = useIsSessionWarningVisible()
  const refreshToken = useRefreshToken()
  const sendEmailVerification = useSendEmailVerification()

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at != null

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">Access Denied</span>
        </div>
        <p className="text-red-700 mt-1">
          Only administrators can access the security dashboard.
        </p>
      </div>
    )
  }

  const handleRefreshToken = async () => {
    setIsRefreshing(true)
    try {
      await refreshToken()
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Session Status */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Session Status
              </p>
              <p className="text-lg font-bold text-gray-900">
                {isSessionWarningVisible ? 'Warning' : 'Active'}
              </p>
            </div>
            <Clock
              className={`h-8 w-8 ${isSessionWarningVisible ? 'text-amber-500' : 'text-green-500'}`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Active for{' '}
            {formatDuration(Date.now() - securityContext.sessionStartTime)}
          </p>
        </div>

        {/* Token Status */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Token Status</p>
              <p className="text-lg font-bold text-gray-900">Valid</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last refreshed{' '}
            {formatDuration(Date.now() - securityContext.tokenLastRefreshed)}{' '}
            ago
          </p>
        </div>

        {/* Email Verification */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email Status</p>
              <p className="text-lg font-bold text-gray-900">
                {isEmailVerified ? 'Verified' : 'Unverified'}
              </p>
            </div>
            {isEmailVerified ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Mail className="h-8 w-8 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
        </div>

        {/* Security Score */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Security Score
              </p>
              <p className="text-lg font-bold text-gray-900">
                {isEmailVerified ? '95%' : '75%'}
              </p>
            </div>
            <Shield
              className={`h-8 w-8 ${isEmailVerified ? 'text-green-500' : 'text-amber-500'}`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isEmailVerified ? 'Excellent' : 'Good'}
          </p>
        </div>
      </div>

      {/* Security Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Security Configuration
            </h3>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Session Management
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Timeout:</span>
                  <span className="font-medium">
                    {formatDuration(securityConfig.sessionTimeout)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Warning Time:</span>
                  <span className="font-medium">
                    {formatDuration(securityConfig.sessionWarningTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activity Check:</span>
                  <span className="font-medium">
                    {formatDuration(securityConfig.activityCheckInterval)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Token Management
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotation Enabled:</span>
                  <span className="font-medium">
                    {securityConfig.refreshTokenRotationEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotation Interval:</span>
                  <span className="font-medium">
                    {formatDuration(
                      securityConfig.refreshTokenRotationInterval,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refresh Threshold:</span>
                  <span className="font-medium">
                    {formatDuration(securityConfig.tokenRefreshThreshold)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Security Actions
            </h3>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Token'}</span>
            </Button>

            {!isEmailVerified && (
              <Button
                onClick={() =>
                  sendEmailVerification(user.email, user.id, createAuditLog)
                }
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Send Verification</span>
              </Button>
            )}

            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => window.location.reload()}
            >
              <Shield className="h-4 w-4" />
              <span>Force Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Current Session Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Current Session
            </h3>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">
                Session Started:
              </span>
              <p className="text-gray-600">
                {formatTimestamp(securityContext.sessionStartTime)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Activity:</span>
              <p className="text-gray-600">
                {formatTimestamp(securityContext.lastActivity)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Token Last Refreshed:
              </span>
              <p className="text-gray-600">
                {formatTimestamp(securityContext.tokenLastRefreshed)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Login Attempts:</span>
              <p className="text-gray-600">{securityContext.loginAttempts}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
