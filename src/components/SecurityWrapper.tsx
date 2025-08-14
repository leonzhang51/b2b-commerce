import type { ReactNode } from 'react'
import { useActivityTracking } from '@/hooks/useActivityTracking'

interface SecurityWrapperProps {
  children: ReactNode
}

/**
 * SecurityWrapper replaces the SecurityProvider context
 * It uses the useActivityTracking hook to initialize security monitoring
 */
export function SecurityWrapper({ children }: SecurityWrapperProps) {
  // Initialize activity tracking and security monitoring
  useActivityTracking()

  return <>{children}</>
}
