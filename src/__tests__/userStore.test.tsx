import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { AuthUser } from '@/types/auth'
import {
  useCurrentUser,
  useIsAuthenticated,
  useUserRole,
  useUserStore,
} from '@/store/userStore'

// Mock user data
const mockUser: AuthUser = {
  id: '123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  role: 'admin',
  permissions: ['read', 'write'],
}

describe('useUserStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useUserStore.getState().clearUser()
  })

  it('should initialize with null user and not authenticated', () => {
    const { result } = renderHook(() => useUserStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should set user and mark as authenticated', () => {
    const { result } = renderHook(() => useUserStore())

    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should clear user and mark as not authenticated', () => {
    const { result } = renderHook(() => useUserStore())

    // First set a user
    act(() => {
      result.current.setUser(mockUser)
    })

    // Then clear the user
    act(() => {
      result.current.clearUser()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should update user data', () => {
    const { result } = renderHook(() => useUserStore())

    // First set a user
    act(() => {
      result.current.setUser(mockUser)
    })

    // Update user data
    act(() => {
      result.current.updateUser({ first_name: 'Jane', role: 'manager' })
    })

    expect(result.current.user?.first_name).toBe('Jane')
    expect(result.current.user?.role).toBe('manager')
    expect(result.current.user?.email).toBe(mockUser.email) // Should preserve other fields
  })

  it('should not update user when no user is set', () => {
    const { result } = renderHook(() => useUserStore())

    act(() => {
      result.current.updateUser({ first_name: 'Jane' })
    })

    expect(result.current.user).toBeNull()
  })
})

describe('useCurrentUser selector', () => {
  it('should return current user', () => {
    const { result: storeResult } = renderHook(() => useUserStore())
    const { result: userResult } = renderHook(() => useCurrentUser())

    act(() => {
      storeResult.current.setUser(mockUser)
    })

    expect(userResult.current).toEqual(mockUser)
  })
})

describe('useIsAuthenticated selector', () => {
  beforeEach(() => {
    useUserStore.getState().clearUser()
  })

  it('should return authentication status', () => {
    const { result: storeResult } = renderHook(() => useUserStore())
    const { result: authResult } = renderHook(() => useIsAuthenticated())

    expect(authResult.current).toBe(false)

    act(() => {
      storeResult.current.setUser(mockUser)
    })

    expect(authResult.current).toBe(true)
  })
})

describe('useUserRole selector', () => {
  beforeEach(() => {
    useUserStore.getState().clearUser()
  })

  it('should return user role', () => {
    const { result: storeResult } = renderHook(() => useUserStore())
    const { result: roleResult } = renderHook(() => useUserRole())

    expect(roleResult.current).toBeUndefined()

    act(() => {
      storeResult.current.setUser(mockUser)
    })

    expect(roleResult.current).toBe('admin')
  })
})
