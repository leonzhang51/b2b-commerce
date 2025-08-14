import { useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAuditLogger } from '@/hooks/useAuditLog'
import { useSecurityStore, useUpdateActivity } from '@/store/securityStore'

/**
 * Hook to handle activity tracking and security monitoring
 * This replaces the SecurityProvider context with Zustand store integration
 */
export function useActivityTracking() {
  const { user, signOut } = useAuth()
  const { createAuditLog } = useAuditLogger()

  // Get store actions without causing re-renders
  const updateActivity = useUpdateActivity()
  const startSessionMonitoring = useSecurityStore(
    (state) => state.startSessionMonitoring,
  )
  const stopSessionMonitoring = useSecurityStore(
    (state) => state.stopSessionMonitoring,
  )
  const startTokenRefresh = useSecurityStore((state) => state.startTokenRefresh)
  const stopTokenRefresh = useSecurityStore((state) => state.stopTokenRefresh)

  // Activity tracking
  useEffect(() => {
    if (!user) return

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    const handleActivity = () => {
      updateActivity()
    }

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      // Remove activity listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [user]) // Remove updateActivity from deps - it's stable in Zustand

  // Session monitoring
  useEffect(() => {
    if (!user) return

    startSessionMonitoring(user, signOut, createAuditLog)

    return () => {
      stopSessionMonitoring()
    }
  }, [user, signOut, createAuditLog]) // Remove store actions from deps

  // Token refresh monitoring
  useEffect(() => {
    if (!user) return

    startTokenRefresh(user, signOut, createAuditLog)

    return () => {
      stopTokenRefresh()
    }
  }, [user, signOut, createAuditLog]) // Remove store actions from deps

  // Note: We don't need to reset security context here as the store handles its own state

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSessionMonitoring()
      stopTokenRefresh()
    }
  }, []) // Remove store actions from deps - cleanup only needs to run on unmount
}
