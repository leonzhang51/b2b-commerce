import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useDismissSessionWarning,
  useExtendSession,
  useIsSessionWarningVisible,
  useTimeUntilTimeout,
} from '@/store/securityStore'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'

export function SessionTimeoutModal() {
  const { user, signOut } = useAuth()
  const isSessionWarningVisible = useIsSessionWarningVisible()
  const timeUntilTimeout = useTimeUntilTimeout()
  const extendSession = useExtendSession()
  const dismissSessionWarning = useDismissSessionWarning()

  const [countdown, setCountdown] = useState(0)
  const [isExtending, setIsExtending] = useState(false)

  // Update countdown timer
  useEffect(() => {
    if (!isSessionWarningVisible) {
      setCountdown(0)
      return
    }

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor(timeUntilTimeout / 1000))
      setCountdown(remaining)

      if (remaining <= 0) {
        // Session has expired, sign out
        signOut()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isSessionWarningVisible, timeUntilTimeout, signOut])

  const handleExtendSession = async () => {
    setIsExtending(true)
    try {
      extendSession()
      // Small delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setIsExtending(false)
    }
  }

  const handleSignOut = () => {
    signOut()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!user || !isSessionWarningVisible) {
    return null
  }

  return (
    <Modal
      open={isSessionWarningVisible}
      onOpenChange={() => {}} // Prevent closing by clicking outside
      title="Session Timeout Warning"
    >
      <div className="space-y-6">
        {/* Warning Header */}
        <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">
              Your session is about to expire
            </h3>
            <p className="text-sm text-amber-700">
              For your security, you will be automatically signed out due to
              inactivity.
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Time remaining:
            </span>
          </div>
          <div className="text-3xl font-bold text-red-600 font-mono">
            {formatTime(countdown)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            You will be signed out automatically when the timer reaches zero.
          </p>
        </div>

        {/* User Information */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Signed in as:</span>
            <span className="ml-2 text-gray-900">{user.email}</span>
          </div>
          {user.full_name && (
            <div className="text-sm mt-1">
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{user.full_name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExtendSession}
            disabled={isExtending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExtending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Extending Session...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Stay Signed In
              </>
            )}
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Sign Out Now
          </Button>
        </div>

        {/* Additional Options */}
        <div className="border-t pt-4">
          <Button
            onClick={dismissSessionWarning}
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 hover:text-gray-800"
          >
            Dismiss Warning (session will still timeout)
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center border-t pt-3">
          <p>
            This timeout helps protect your account from unauthorized access.
            <br />
            Your session will be automatically extended when you interact with
            the application.
          </p>
        </div>
      </div>
    </Modal>
  )
}
