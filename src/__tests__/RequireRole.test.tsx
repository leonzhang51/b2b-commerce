import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RequireRole } from '../components/RequireRole'
import { useAuth } from '../hooks/useAuth'

import type { Mock } from 'vitest'

vi.mock('@/hooks/useAuth')
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate-to">{to}</div>
  ),
}))

const TestComponent = () => <div>Protected Content</div>

describe('RequireRole', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders children if user has allowed role', () => {
    ;(useAuth as Mock).mockReturnValue({
      user: { role: 'admin', permissions: ['admin'] },
      loading: false,
    })
    render(
      <RequireRole allowedRoles={['admin']}>
        <TestComponent />
      </RequireRole>,
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects if user does not have allowed role', () => {
    ;(useAuth as Mock).mockReturnValue({
      user: { role: 'buyer', permissions: ['buyer'] },
      loading: false,
    })
    render(
      <RequireRole allowedRoles={['admin']}>
        <TestComponent />
      </RequireRole>,
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
  })

  it('shows loading if loading is true', () => {
    ;(useAuth as Mock).mockReturnValue({ user: null, loading: true })
    render(
      <RequireRole allowedRoles={['admin']}>
        <TestComponent />
      </RequireRole>,
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
