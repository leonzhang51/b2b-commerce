import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserData } from '@/hooks/useUserData'
import { useUpdateUser } from '@/hooks/useUpdateUser'
import { useCompaniesWithUsers, useCompanyUsers } from '@/hooks/useCompanyUsers'

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
        order: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-user', role: 'admin' },
    loading: false,
  }),
}))

// Helper to render hooks with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useUserData', () => {
  it('should fetch user data successfully', async () => {
    const mockUser = {
      id: '1',
      company_id: 'comp1',
      email: 'test@test.com',
      full_name: 'Test User',
      role: 'admin' as const,
      is_active: true,
      permissions: [],
      trade_type: 'general' as const,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    }

    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => useUserData('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.error).toBe(null)
  })

  it('should handle error when fetching user data', async () => {
    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => useUserData('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.error).toBe('User not found')
  })
})

describe('useUpdateUser', () => {
  it('should update user successfully', async () => {
    const mockUser = {
      id: '1',
      first_name: 'Updated',
      last_name: 'User',
      company_id: 'comp1',
      phone: '123-456-7890',
      job_title: 'Manager',
      department: 'Sales',
      trade_type: 'general' as const,
      permissions: ['admin'],
      is_active: true,
    }

    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockImplementation((() => {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: { id: 'audit-1' }, error: null }),
          }),
        }),
      }
    }) as any)

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    })

    const updatedUser = await result.current.updateUser(mockUser)

    expect(updatedUser).toEqual(mockUser)
  })

  it('should update user role successfully', async () => {
    const mockUser = {
      id: '1',
      first_name: 'Test',
      last_name: 'User',
      company_id: 'comp1',
      phone: '123-456-7890',
      job_title: 'Manager',
      department: 'Sales',
      trade_type: 'general' as const,
      permissions: ['admin'],
      is_active: true,
      role: 'buyer',
    }

    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockImplementation((() => {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockUser, role: 'buyer' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockUser, role: 'manager' },
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'audit-1' },
              error: null,
            }),
          }),
        }),
      }
    }) as any)

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    })

    const success = await result.current.updateUserRole('1', 'manager')

    expect(success).toBe(true)
  })
})

describe('useCompaniesWithUsers', () => {
  it('should fetch companies with users successfully', async () => {
    const mockCompanies = [
      {
        id: '1',
        name: 'Company 1',
        trade_type: 'general' as const,
        is_active: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        users: [{ id: 'user1' }],
      },
    ]

    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockCompanies, error: null }),
      }),
    } as any)

    const { result } = renderHook(() => useCompaniesWithUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.companies).toEqual(mockCompanies)
    expect(result.current.error).toBe(null)
  })
})

describe('useCompanyUsers', () => {
  it('should fetch users for a company successfully', async () => {
    const mockUsers = [
      {
        id: '1',
        company_id: 'comp1',
        email: 'user@test.com',
        full_name: 'Test User',
        role: 'admin' as const,
        is_active: true,
        permissions: [],
        trade_type: 'general' as const,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
    ]

    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => useCompanyUsers('comp1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.users).toEqual(mockUsers)
    expect(result.current.error).toBe(null)
  })

  it('should update user in list', async () => {
    const mockUsers = [
      {
        id: '1',
        company_id: 'comp1',
        email: 'user@test.com',
        full_name: 'Test User',
        role: 'admin' as const,
        is_active: true,
        permissions: [],
        trade_type: 'general' as const,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
    ]

    const mockSupabase = await import('@/lib/supabase')
    vi.mocked(mockSupabase.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => useCompanyUsers('comp1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updatedUser = { ...mockUsers[0], full_name: 'Updated User' }

    await waitFor(() => {
      result.current.updateUserInList(updatedUser)
    })

    await waitFor(() => {
      expect(result.current.users[0].full_name).toBe('Updated User')
    })
  })
})
