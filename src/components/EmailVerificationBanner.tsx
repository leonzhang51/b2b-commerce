import { useState } from 'react'
import { AlertCircle, CheckCircle, Mail, RefreshCw, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuditLogger } from '@/hooks/useAuditLog'
import {
  useSecurityStore,
  useSendEmailVerification,
} from '@/store/securityStore'
import { Button } from '@/components/ui/button'
import { isEmailVerificationRequired } from '@/config/security'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const { createAuditLog } = useAuditLogger()
  const isEmailVerificationSent = useSecurityStore(
    (state) => state.isEmailVerificationSent,
  )
  const sendEmailVerification = useSendEmailVerification()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at != null

  // Don't show banner if:
  // - No user is logged in
  // - Email verification is not required
  // - Email is already verified
  // - Banner has been dismissed
  if (
    !user ||
    !isEmailVerificationRequired() ||
    isEmailVerified ||
    isDismissed
  ) {
    return null
  }

  const handleSendVerification = async () => {
    setIsSending(true)
    try {
      await sendEmailVerification(user.email, user.id, createAuditLog)
    } finally {
      setIsSending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3 flex-1">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <p className="text-sm font-medium text-amber-800">
                  Please verify your email address
                </p>
                <p className="text-sm text-amber-700">
                  Check your inbox for a verification link or click to resend.
                </p>
              </div>

              <div className="mt-1 flex items-center space-x-1 text-xs text-amber-600">
                <Mail className="h-3 w-3" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {/* Success message */}
            {isEmailVerificationSent && (
              <div className="flex items-center space-x-1 text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                <CheckCircle className="h-4 w-4" />
                <span>Verification email sent!</span>
              </div>
            )}

            {/* Resend button */}
            <Button
              onClick={handleSendVerification}
              disabled={isSending || isEmailVerificationSent}
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : isEmailVerificationSent ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Sent
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Resend
                </>
              )}
            </Button>

            {/* Dismiss button */}
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1"
              aria-label="Dismiss verification banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Additional help text */}
      <div className="border-t border-amber-200 bg-amber-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-amber-600">
            <div className="flex items-center space-x-4">
              <span>• Check your spam folder if you don't see the email</span>
              <span>• The verification link expires in 24 hours</span>
            </div>
            <div className="mt-1 sm:mt-0">
              <span>Need help? Contact support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for smaller screens or less prominent placement
export function EmailVerificationBannerCompact() {
  const { user } = useAuth()
  const { createAuditLog } = useAuditLogger()
  const isEmailVerificationSent = useSecurityStore(
    (state) => state.isEmailVerificationSent,
  )
  const sendEmailVerification = useSendEmailVerification()
  const [isSending, setIsSending] = useState(false)

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at != null

  if (!user || !isEmailVerificationRequired() || isEmailVerified) {
    return null
  }

  const handleSendVerification = async () => {
    setIsSending(true)
    try {
      await sendEmailVerification(user.email, user.id, createAuditLog)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 m-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            Verify your email
          </span>
        </div>

        <Button
          onClick={handleSendVerification}
          disabled={isSending || isEmailVerificationSent}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1"
        >
          {isSending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : isEmailVerificationSent ? (
            'Sent!'
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  )
}
