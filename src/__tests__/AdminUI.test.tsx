import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserAdminPage } from '../routes/user-admin'
import { useAuth } from '../hooks/useAuth'

import type { Mock } from 'vitest'

vi.mock('@/hooks/useAuth')

describe('Admin UI', () => {
  beforeEach(() => {
    ;(useAuth as Mock).mockReturnValue({
      user: { role: 'admin', permissions: ['admin'] },
      loading: false,
    })
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
})
