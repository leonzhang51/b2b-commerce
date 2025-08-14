// Security configuration for the application
export interface SecurityConfig {
  // Session management
  sessionTimeout: number // in milliseconds
  sessionWarningTime: number // in milliseconds before timeout to show warning
  activityCheckInterval: number // in milliseconds

  // Token management
  refreshTokenRotationEnabled: boolean
  refreshTokenRotationInterval: number // in milliseconds
  tokenRefreshThreshold: number // in milliseconds before expiry to refresh

  // Email verification
  emailVerificationRequired: boolean
  emailVerificationReminderInterval: number // in milliseconds

  // Security headers and policies
  maxLoginAttempts: number
  lockoutDuration: number // in milliseconds
}

// Default security configuration
const defaultConfig: SecurityConfig = {
  // Session timeout: 30 minutes
  sessionTimeout: 30 * 60 * 1000,
  // Show warning 5 minutes before timeout
  sessionWarningTime: 5 * 60 * 1000,
  // Check activity every 30 seconds
  activityCheckInterval: 30 * 1000,

  // Refresh token every 15 minutes
  refreshTokenRotationEnabled: true,
  refreshTokenRotationInterval: 15 * 60 * 1000,
  // Refresh token 5 minutes before expiry
  tokenRefreshThreshold: 5 * 60 * 1000,

  // Email verification settings
  emailVerificationRequired: true,
  // Show reminder every 24 hours
  emailVerificationReminderInterval: 24 * 60 * 60 * 1000,

  // Security policies
  maxLoginAttempts: 5,
  // Lockout for 15 minutes
  lockoutDuration: 15 * 60 * 1000,
}

// Environment-based configuration overrides
const getEnvironmentConfig = (): Partial<SecurityConfig> => {
  const env = import.meta.env.MODE

  switch (env) {
    case 'development':
      return {
        // Shorter timeouts for development
        sessionTimeout: 60 * 60 * 1000, // 1 hour
        sessionWarningTime: 10 * 60 * 1000, // 10 minutes
        refreshTokenRotationInterval: 30 * 60 * 1000, // 30 minutes
        emailVerificationRequired: false, // Optional in dev
      }

    case 'staging':
      return {
        sessionTimeout: 45 * 60 * 1000, // 45 minutes
        emailVerificationRequired: true,
      }

    case 'production':
      return {
        // Stricter settings for production
        sessionTimeout: 20 * 60 * 1000, // 20 minutes
        sessionWarningTime: 3 * 60 * 1000, // 3 minutes
        refreshTokenRotationInterval: 10 * 60 * 1000, // 10 minutes
        emailVerificationRequired: true,
        maxLoginAttempts: 3,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
      }

    default:
      return {}
  }
}

// Merge default config with environment-specific overrides
export const securityConfig: SecurityConfig = {
  ...defaultConfig,
  ...getEnvironmentConfig(),
}

// Helper functions for security configuration
export const getSessionTimeoutMs = () => securityConfig.sessionTimeout
export const getSessionWarningMs = () => securityConfig.sessionWarningTime
export const getActivityCheckIntervalMs = () =>
  securityConfig.activityCheckInterval
export const getRefreshIntervalMs = () =>
  securityConfig.refreshTokenRotationInterval
export const getTokenRefreshThresholdMs = () =>
  securityConfig.tokenRefreshThreshold
export const isEmailVerificationRequired = () =>
  securityConfig.emailVerificationRequired
export const getEmailReminderIntervalMs = () =>
  securityConfig.emailVerificationReminderInterval
export const getMaxLoginAttempts = () => securityConfig.maxLoginAttempts
export const getLockoutDurationMs = () => securityConfig.lockoutDuration

// Security event types for logging
export enum SecurityEventType {
  SESSION_TIMEOUT = 'session_timeout',
  SESSION_WARNING = 'session_warning',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_ROTATION = 'token_rotation',
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  EMAIL_VERIFICATION_REMINDER = 'email_verification_reminder',
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_FAILED = 'login_failed',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

// Security context for tracking user activity
export interface SecurityContext {
  lastActivity: number
  sessionStartTime: number
  tokenLastRefreshed: number
  emailVerificationLastSent?: number
  emailVerificationLastReminded?: number
  loginAttempts: number
  lastLoginAttempt?: number
  isLocked: boolean
  lockoutUntil?: number
}

// Create initial security context
export const createSecurityContext = (): SecurityContext => ({
  lastActivity: Date.now(),
  sessionStartTime: Date.now(),
  tokenLastRefreshed: Date.now(),
  loginAttempts: 0,
  isLocked: false,
})

// Helper to check if session is expired
export const isSessionExpired = (context: SecurityContext): boolean => {
  const now = Date.now()
  const timeSinceLastActivity = now - context.lastActivity
  return timeSinceLastActivity > securityConfig.sessionTimeout
}

// Helper to check if session warning should be shown
export const shouldShowSessionWarning = (context: SecurityContext): boolean => {
  const now = Date.now()
  const timeSinceLastActivity = now - context.lastActivity
  const timeUntilTimeout = securityConfig.sessionTimeout - timeSinceLastActivity
  return (
    timeUntilTimeout <= securityConfig.sessionWarningTime &&
    timeUntilTimeout > 0
  )
}

// Helper to check if token should be refreshed
export const shouldRefreshToken = (context: SecurityContext): boolean => {
  const now = Date.now()
  const timeSinceLastRefresh = now - context.tokenLastRefreshed
  return timeSinceLastRefresh >= securityConfig.refreshTokenRotationInterval
}

// Helper to check if account is locked
export const isAccountLocked = (context: SecurityContext): boolean => {
  if (!context.isLocked) return false
  if (!context.lockoutUntil) return false
  return Date.now() < context.lockoutUntil
}
