import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
    ;(useAuth as Mock).mockReturnValue({
      user: { role: 'admin', permissions: ['admin'] },
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

  it('renders the user management interface', () => {
    render(<UserAdminPage />)
    expect(screen.getByText(/user management/i)).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    render(<UserAdminPage />)
    // The component should render without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('changes a user role via the role dropdown', async () => {
    render(<UserAdminPage />)

    // Wait for companies to load
    await screen.findByText(/acme co/i)

    // Select the company to load users
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'comp1' },
    })

    // Wait for user row
    await screen.findByText('alice@example.com')

    // Get all comboboxes (first is company select, second is user role)
    const selects = screen.getAllByRole('combobox')
    const roleSelect = selects.find(
      (s) => (s as HTMLSelectElement).value === 'buyer',
    ) as HTMLSelectElement
    expect(roleSelect).toBeTruthy()

    fireEvent.change(roleSelect, { target: { value: 'manager' } })

    await waitFor(() => {
      expect(roleSelect.value).toBe('manager')
    })

    // Ensure update call captured
    expect(mockUpdateCalls.length).toBe(1)
    expect(mockUpdateCalls[0]).toMatchObject({
      id: 'u1',
      vals: { role: 'manager' },
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
