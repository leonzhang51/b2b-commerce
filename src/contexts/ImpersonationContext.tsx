import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useAuditLogger } from '@/hooks/useAuditLog'

interface ImpersonationContextType {
  isImpersonating: boolean
  impersonatedUser: User | null
  originalUser: User | null
  startImpersonation: (targetUser: User) => void
  endImpersonation: () => void
  canImpersonate: boolean
}

const ImpersonationContext = createContext<
  ImpersonationContextType | undefined
>(undefined)

interface ImpersonationProviderProps {
  children: ReactNode
}

export function ImpersonationProvider({
  children,
}: ImpersonationProviderProps) {
  const { user: authUser } = useAuth()
  const { logImpersonationStart, logImpersonationEnd } = useAuditLogger()

  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null)
  const [originalUser, setOriginalUser] = useState<User | null>(null)

  // Check if current user can impersonate (admin only)
  const canImpersonate = authUser?.role === 'admin' && !isImpersonating

  // Load impersonation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('impersonation_state')
    if (savedState) {
      try {
        const {
          isImpersonating: saved,
          impersonatedUser: savedUser,
          originalUser: savedOriginal,
        } = JSON.parse(savedState)
        if (saved && savedUser && savedOriginal) {
          setIsImpersonating(true)
          setImpersonatedUser(savedUser)
          setOriginalUser(savedOriginal)
        }
      } catch (error) {
        console.error('Failed to restore impersonation state:', error)
        localStorage.removeItem('impersonation_state')
      }
    }
  }, [])

  // Save impersonation state to localStorage
  const saveState = (
    impersonating: boolean,
    impersonated: User | null,
    original: User | null,
  ) => {
    if (impersonating && impersonated && original) {
      localStorage.setItem(
        'impersonation_state',
        JSON.stringify({
          isImpersonating: impersonating,
          impersonatedUser: impersonated,
          originalUser: original,
        }),
      )
    } else {
      localStorage.removeItem('impersonation_state')
    }
  }

  const startImpersonation = (targetUser: User) => {
    if (!authUser || authUser.role !== 'admin') {
      throw new Error('Only admins can impersonate users')
    }

    if (isImpersonating) {
      throw new Error('Already impersonating a user')
    }

    if (targetUser.id === authUser.id) {
      throw new Error('Cannot impersonate yourself')
    }

    setIsImpersonating(true)
    setImpersonatedUser(targetUser)

    // Convert AuthUser to User format for consistency
    const originalUserAsUser: User = {
      id: authUser.id,
      email: authUser.email,
      company_id: '', // AuthUser doesn't have this, but we need it for User type
      full_name:
        `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() ||
        authUser.email,
      phone: '',
      job_title: '',
      department: '',
      trade_type: 'general',
      permissions: authUser.permissions || [],
      is_active: true,
      role: authUser.role ?? 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setOriginalUser(originalUserAsUser)
    saveState(true, targetUser, originalUserAsUser)

    // Log the impersonation start
    logImpersonationStart(targetUser.id, {
      target_user_name: targetUser.full_name,
      target_user_email: targetUser.email,
      original_user_name: originalUserAsUser.full_name,
      original_user_email: authUser.email,
    })

    // Show notification
    console.log(
      `Started impersonating ${targetUser.full_name} (${targetUser.email})`,
    )
  }

  const endImpersonation = () => {
    if (!isImpersonating || !impersonatedUser || !originalUser) {
      return
    }

    // Log the impersonation end
    logImpersonationEnd(impersonatedUser.id, {
      target_user_name: impersonatedUser.full_name,
      target_user_email: impersonatedUser.email,
      original_user_name: originalUser.full_name,
      original_user_email: originalUser.email,
    })

    setIsImpersonating(false)
    setImpersonatedUser(null)
    setOriginalUser(null)
    saveState(false, null, null)

    // Show notification
    console.log(`Ended impersonation of ${impersonatedUser.full_name}`)
  }

  // Auto-end impersonation if auth user changes (logout, etc.)
  useEffect(() => {
    if (!authUser && isImpersonating) {
      setIsImpersonating(false)
      setImpersonatedUser(null)
      setOriginalUser(null)
      saveState(false, null, null)
    }
  }, [authUser, isImpersonating])

  const value: ImpersonationContextType = {
    isImpersonating,
    impersonatedUser,
    originalUser,
    startImpersonation,
    endImpersonation,
    canImpersonate,
  }

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext)
  if (context === undefined) {
    throw new Error(
      'useImpersonation must be used within an ImpersonationProvider',
    )
  }
  return context
}

// Hook to get the effective user (impersonated user if impersonating, otherwise auth user)
export function useEffectiveUser() {
  const { user: authUser } = useAuth()
  const { isImpersonating, impersonatedUser } = useImpersonation()

  return isImpersonating ? impersonatedUser : authUser
}
