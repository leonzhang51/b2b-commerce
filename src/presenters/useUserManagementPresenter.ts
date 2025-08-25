import { useEffect, useState } from 'react'
import type {
  LoginCredentials,
  RegisterData,
} from '@/usecases/UserManagementUseCase'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { UserManagementUseCase } from '@/usecases/UserManagementUseCase'
import { SupabaseUserRepository } from '@/models/UserRepository'
import { supabase } from '@/lib/supabase'

export interface UserManagementPresenterState {
  readonly user: any | null
  readonly loading: boolean
  readonly error: string | null
  readonly isLocked: boolean
  readonly lockoutUntil?: number
  readonly attemptsRemaining?: number
  readonly loginAttempts: number
}

export interface UserManagementPresenterActions {
  readonly login: (credentials: LoginCredentials) => Promise<boolean>
  readonly register: (userData: RegisterData) => Promise<boolean>
  readonly logout: () => Promise<void>
  readonly clearError: () => void
  readonly checkLockStatus: (email: string) => Promise<void>
  readonly hasPermission: (permission: string) => boolean
  readonly hasRole: (role: string) => boolean
  readonly hasAnyRole: (roles: Array<string>) => boolean
}

export interface UserManagementPresenterReturn
  extends UserManagementPresenterState,
    UserManagementPresenterActions {}

/**
 * Presenter for User Management functionality
 *
 * Orchestrates user authentication, authorization, and profile management
 */
export function useUserManagementPresenter(): UserManagementPresenterReturn {
  const { user: authUser, loading: authLoading } = useAuth()
  const addNotification = useUIStore((state) => state.addNotification)

  // Local state
  const [userRepository] = useState(() => new SupabaseUserRepository(supabase))
  const [userManagementUseCase] = useState(
    () => new UserManagementUseCase(userRepository as any),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState<number | undefined>()
  const [attemptsRemaining, setAttemptsRemaining] = useState<
    number | undefined
  >()
  const [loginAttempts, setLoginAttempts] = useState(0)

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      setIsLocked(false)
      setLockoutUntil(undefined)
      setAttemptsRemaining(undefined)

      const result = await userManagementUseCase.loginUser(credentials)

      if (result.success) {
        addNotification({
          type: 'success',
          message: 'Successfully logged in!',
        })
        return true
      } else {
        setError(result.error || 'Login failed')

        if (result.isLocked) {
          setIsLocked(true)
          setLockoutUntil(result.lockoutUntil)

          if (result.lockoutUntil) {
            const timeRemaining = userManagementUseCase.formatLockoutTime(
              result.lockoutUntil,
            )
            addNotification({
              type: 'error',
              message: `Account locked. Try again in ${timeRemaining}.`,
            })
          }
        } else if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining)

          if (result.attemptsRemaining > 0) {
            addNotification({
              type: 'warning',
              message: `Invalid credentials. ${result.attemptsRemaining} attempts remaining.`,
            })
          }
        } else {
          addNotification({
            type: 'error',
            message: result.error || 'Login failed',
          })
        }

        return false
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const result = await userManagementUseCase.registerUser(userData)

      if (result.success) {
        addNotification({
          type: 'success',
          message:
            'Account created successfully! Please check your email to verify your account.',
        })
        return true
      } else {
        setError(result.error || 'Registration failed')
        addNotification({
          type: 'error',
          message: result.error || 'Registration failed',
        })
        return false
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      addNotification({
        type: 'info',
        message: 'Successfully logged out',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
    setIsLocked(false)
    setLockoutUntil(undefined)
    setAttemptsRemaining(undefined)
  }

  const checkLockStatus = async (email: string): Promise<void> => {
    try {
      const lockStatus = await userRepository.isUserLocked(email)
      setIsLocked(lockStatus.locked)
      setLockoutUntil(lockStatus.until)

      const attempts = await userRepository.getUserLoginAttempts(email)
      setLoginAttempts(attempts)
    } catch (err) {
      // Silently handle errors for lock status check
      console.warn('Failed to check lock status:', err)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!authUser) return false
    return userManagementUseCase.hasPermission(authUser as any, permission)
  }

  const hasRole = (role: string): boolean => {
    if (!authUser) return false
    return userManagementUseCase.hasRole(authUser as any, role)
  }

  const hasAnyRole = (roles: Array<string>): boolean => {
    if (!authUser) return false
    return userManagementUseCase.hasAnyRole(authUser as any, roles)
  }

  // Update lock status when lockout time expires
  useEffect(() => {
    if (isLocked && lockoutUntil) {
      const timeRemaining =
        userManagementUseCase.getTimeUntilUnlock(lockoutUntil)

      if (timeRemaining <= 0) {
        setIsLocked(false)
        setLockoutUntil(undefined)
        addNotification({
          type: 'info',
          message: 'Account has been unlocked. You can try logging in again.',
        })
      } else {
        // Set a timer to update when the lockout expires
        const timer = setTimeout(() => {
          setIsLocked(false)
          setLockoutUntil(undefined)
          addNotification({
            type: 'info',
            message: 'Account has been unlocked. You can try logging in again.',
          })
        }, timeRemaining)

        return () => clearTimeout(timer)
      }
    }
  }, [isLocked, lockoutUntil, userManagementUseCase, addNotification])

  return {
    // State
    user: authUser,
    loading: loading || authLoading,
    error,
    isLocked,
    lockoutUntil,
    attemptsRemaining,
    loginAttempts,

    // Actions
    login,
    register,
    logout,
    clearError,
    checkLockStatus,
    hasPermission,
    hasRole,
    hasAnyRole,
  }
}
