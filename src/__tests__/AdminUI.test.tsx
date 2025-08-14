import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserAdminPage } from '../routes/user-admin'

import { useAuth } from '../hooks/useAuth'

import type { Mock } from 'vitest'
import { RequireRole } from '@/components/RequireRole'

vi.mock('@/hooks/useAuth')
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate-to">{to}</div>
  ),
  createFileRoute: vi.fn((_path: string) => (config: any) => config),
}))

// Mock supabase for admin UI interactions
let mockUsers: Array<any> = []
const mockUpdateCalls: Array<any> = []

vi.mock('@/lib/supabase', () => {
  const from = (table: string) => {
    if (table === 'companies') {
      return {
        select: () => ({
          order: () =>
            Promise.resolve({
              data: [
                {
                  id: 'comp1',
                  name: 'Acme Co',
                  users: [{ id: 'u1' }],
                },
              ],
              error: null,
            }),
        }),
      }
    }
    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: mockUsers,
                error: null,
              }),
          }),
        }),
        update: (vals: any) => ({
          eq: (_col: string, id: string) => {
            mockUpdateCalls.push({ id, vals })
            mockUsers = mockUsers.map((u) =>
              u.id === id
                ? { ...u, ...vals, updated_at: new Date().toISOString() }
                : u,
            )
            return Promise.resolve({ error: null })
          },
        }),
      }
    }
    return {}
  }
  return { supabase: { from } }
})

describe('Admin UI', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    ;(useAuth as Mock).mockReturnValue({
      user: { id: 'admin-user', role: 'admin', permissions: ['admin'] },
      loading: false,
    })
    mockUsers = [
      {
        id: 'u1',
        company_id: 'comp1',
        email: 'alice@example.com',
        full_name: 'Alice Example',
        phone: '',
        job_title: '',
        department: '',
        trade_type: 'contractor',
        permissions: ['buyer'],
        is_active: true,
        role: 'buyer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
    mockUpdateCalls.length = 0
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    )
  }

  it('renders the admin dashboard interface', () => {
    renderWithQueryClient(<UserAdminPage />)
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
    expect(
      screen.getByText(/manage your b2b commerce platform/i),
    ).toBeInTheDocument()
  })

  it('displays dashboard sections', () => {
    renderWithQueryClient(<UserAdminPage />)
    // Check for dashboard sections - use getAllByText for multiple matches
    expect(screen.getByText(/user management/i)).toBeInTheDocument()
    expect(screen.getAllByText(/audit logs/i)).toHaveLength(2) // One in section, one in quick actions
    expect(screen.getAllByText(/deleted items/i)).toHaveLength(2) // One in section, one in quick actions
  })

  it('switches between dashboard sections', async () => {
    renderWithQueryClient(<UserAdminPage />)

    // Initially should show overview
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()

    // Click on Users section
    const usersSection = screen.getByText(/user management/i).closest('button')
    expect(usersSection).toBeTruthy()

    fireEvent.click(usersSection!)

    // Should switch to user management view
    await waitFor(() => {
      expect(screen.getByText(/user management/i)).toBeInTheDocument()
      // Should show company selection
      expect(screen.getByText(/select company/i)).toBeInTheDocument()
    })
  })

  it('blocks access for non-admin user (negative access test)', () => {
    ;(useAuth as Mock).mockReturnValue({
      user: { role: 'buyer', permissions: ['buyer'] },
      loading: false,
    })
    render(
      <RequireRole allowedRoles={['admin']}>
        <UserAdminPage />
      </RequireRole>,
    )
    // Should navigate away
    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
  })

  it('blocks access when unauthenticated (negative access test)', () => {
    ;(useAuth as Mock).mockReturnValue({ user: null, loading: false })
    render(
      <RequireRole allowedRoles={['admin']}>
        <UserAdminPage />
      </RequireRole>,
    )
    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
  })
})
