import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SecurityContext as SecurityContextType } from '@/config/security'
import {
  SecurityEventType,
  createSecurityContext,
  getActivityCheckIntervalMs,
  getRefreshIntervalMs,
  getSessionTimeoutMs,
  isSessionExpired,
  shouldRefreshToken,
  shouldShowSessionWarning,
} from '@/config/security'
import { supabase } from '@/lib/supabase'

interface SecurityState extends SecurityContextType {
  // UI State
  isSessionWarningVisible: boolean
  timeUntilTimeout: number
  isEmailVerificationSent: boolean

  // Timers (stored as IDs, not the actual timer objects)
  refreshTimerId: number | null
  sessionCheckTimerId: number | null

  // Actions
  updateActivity: () => void
  extendSession: () => void
  dismissSessionWarning: () => void
  refreshToken: () => Promise<void>
  sendEmailVerification: (
    userEmail: string,
    userId: string,
    createAuditLog: any,
  ) => Promise<void>
  startSessionMonitoring: (
    user: any,
    signOut: () => void,
    createAuditLog: any,
  ) => void
  stopSessionMonitoring: () => void
  startTokenRefresh: (
    user: any,
    signOut: () => void,
    createAuditLog: any,
  ) => void
  stopTokenRefresh: () => void
  resetSecurityContext: () => void
  setTimeUntilTimeout: (time: number) => void
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      // Initial state from SecurityContext
      ...createSecurityContext(),

      // UI State
      isSessionWarningVisible: false,
      timeUntilTimeout: 0,
      isEmailVerificationSent: false,

      // Timer IDs
      refreshTimerId: null,
      sessionCheckTimerId: null,

      // Actions
      updateActivity: () => {
        set({
          lastActivity: Date.now(),
          isSessionWarningVisible: false,
        })
      },

      extendSession: () => {
        set({
          lastActivity: Date.now(),
          isSessionWarningVisible: false,
        })
      },

      dismissSessionWarning: () => {
        set({ isSessionWarningVisible: false })
      },

      refreshToken: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession()

          if (error) {
            console.error('Token refresh failed:', error)
            return
          }

          if (data.session) {
            set({ tokenLastRefreshed: Date.now() })
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError)
        }
      },

      sendEmailVerification: async (
        userEmail: string,
        userId: string,
        createAuditLog: any,
      ) => {
        try {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: userEmail,
          })

          if (error) {
            console.error('Email verification send failed:', error)
            return
          }

          set({
            isEmailVerificationSent: true,
            emailVerificationLastSent: Date.now(),
          })

          // Log email verification sent
          createAuditLog.mutate({
            user_id: userId,
            action: 'update',
            entity_type: 'system',
            metadata: {
              event_type: SecurityEventType.EMAIL_VERIFICATION_SENT,
              email: userEmail,
              timestamp: new Date().toISOString(),
            },
          })

          // Reset the flag after 5 seconds
          setTimeout(() => set({ isEmailVerificationSent: false }), 5000)
        } catch (verificationError) {
          console.error('Email verification error:', verificationError)
        }
      },

      startSessionMonitoring: (
        user: any,
        signOut: () => void,
        createAuditLog: any,
      ) => {
        // Clear existing timer
        const { sessionCheckTimerId } = get()
        if (sessionCheckTimerId) {
          clearInterval(sessionCheckTimerId)
        }

        const checkSession = () => {
          const state = get()
          const now = Date.now()
          const timeSinceLastActivity = now - state.lastActivity
          const timeRemaining = Math.max(
            0,
            getSessionTimeoutMs() - timeSinceLastActivity,
          )

          // Only update if the time has changed significantly to avoid unnecessary re-renders
          const currentTimeUntilTimeout = get().timeUntilTimeout
          if (Math.abs(timeRemaining - currentTimeUntilTimeout) > 1000) {
            set({ timeUntilTimeout: timeRemaining })
          }

          // Check if session is expired
          if (isSessionExpired(state)) {
            // Log session timeout
            createAuditLog.mutate({
              user_id: user.id,
              action: 'logout',
              entity_type: 'system',
              metadata: {
                event_type: SecurityEventType.SESSION_TIMEOUT,
                reason: 'automatic_timeout',
                timestamp: new Date().toISOString(),
              },
            })

            get().stopSessionMonitoring()
            signOut()
            return
          }

          // Check if session warning should be shown
          if (
            shouldShowSessionWarning(state) &&
            !state.isSessionWarningVisible
          ) {
            set({ isSessionWarningVisible: true })

            // Log session warning
            createAuditLog.mutate({
              user_id: user.id,
              action: 'update',
              entity_type: 'system',
              metadata: {
                event_type: SecurityEventType.SESSION_WARNING,
                time_remaining: timeRemaining,
                timestamp: new Date().toISOString(),
              },
            })
          }
        }

        // Start session monitoring
        const timerId = window.setInterval(
          checkSession,
          getActivityCheckIntervalMs(),
        )
        set({ sessionCheckTimerId: timerId })
      },

      stopSessionMonitoring: () => {
        const { sessionCheckTimerId } = get()
        if (sessionCheckTimerId) {
          clearInterval(sessionCheckTimerId)
          set({ sessionCheckTimerId: null })
        }
      },

      startTokenRefresh: (
        user: any,
        signOut: () => void,
        createAuditLog: any,
      ) => {
        // Clear existing timer
        const { refreshTimerId } = get()
        if (refreshTimerId) {
          clearInterval(refreshTimerId)
        }

        const handleTokenRefresh = async () => {
          const state = get()
          if (shouldRefreshToken(state)) {
            try {
              const { data, error } = await supabase.auth.refreshSession()

              if (error) {
                console.error('Token refresh failed:', error)
                get().stopTokenRefresh()
                signOut()
                return
              }

              if (data.session) {
                set({ tokenLastRefreshed: Date.now() })

                // Log token refresh
                createAuditLog.mutate({
                  user_id: user.id,
                  action: 'update',
                  entity_type: 'system',
                  metadata: {
                    event_type: SecurityEventType.TOKEN_REFRESH,
                    timestamp: new Date().toISOString(),
                  },
                })
              }
            } catch (refreshError) {
              console.error('Token refresh error:', refreshError)
              get().stopTokenRefresh()
              signOut()
            }
          }
        }

        // Start token refresh monitoring
        const timerId = window.setInterval(
          handleTokenRefresh,
          getRefreshIntervalMs(),
        )
        set({ refreshTimerId: timerId })
      },

      stopTokenRefresh: () => {
        const { refreshTimerId } = get()
        if (refreshTimerId) {
          clearInterval(refreshTimerId)
          set({ refreshTimerId: null })
        }
      },

      resetSecurityContext: () => {
        // Stop all timers
        get().stopSessionMonitoring()
        get().stopTokenRefresh()

        // Reset to initial state
        set({
          ...createSecurityContext(),
          isSessionWarningVisible: false,
          timeUntilTimeout: 0,
          isEmailVerificationSent: false,
        })
      },

      setTimeUntilTimeout: (time: number) => {
        set({ timeUntilTimeout: time })
      },
    }),
    {
      name: 'security-store',
      // Only persist essential security context, not UI state or timers
      partialize: (state) => ({
        lastActivity: state.lastActivity,
        sessionStartTime: state.sessionStartTime,
        tokenLastRefreshed: state.tokenLastRefreshed,
        emailVerificationLastSent: state.emailVerificationLastSent,
        emailVerificationLastReminded: state.emailVerificationLastReminded,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt,
        isLocked: state.isLocked,
        lockoutUntil: state.lockoutUntil,
      }),
    },
  ),
)

// Computed selectors for better performance
export const useIsEmailVerified = () =>
  useSecurityStore((state) => {
    // This would need to be passed from the auth context or computed differently
    // For now, we'll handle this in the components
    return false
  })

// Individual session status selectors to avoid object recreation
export const useIsSessionWarningVisible = () =>
  useSecurityStore((state) => state.isSessionWarningVisible)
export const useIsSessionExpired = () =>
  useSecurityStore((state) => isSessionExpired(state))
export const useTimeUntilTimeout = () =>
  useSecurityStore((state) => state.timeUntilTimeout)

// Individual action selectors to avoid object recreation
export const useUpdateActivity = () =>
  useSecurityStore((state) => state.updateActivity)
export const useExtendSession = () =>
  useSecurityStore((state) => state.extendSession)
export const useDismissSessionWarning = () =>
  useSecurityStore((state) => state.dismissSessionWarning)
export const useRefreshToken = () =>
  useSecurityStore((state) => state.refreshToken)
export const useSendEmailVerification = () =>
  useSecurityStore((state) => state.sendEmailVerification)
