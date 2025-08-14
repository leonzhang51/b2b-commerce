import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ImpersonationBanner } from '@/components/ImpersonationBanner'
import { ImpersonationControls } from '@/components/ImpersonationControls'

// Mock the impersonation context
vi.mock('@/contexts/ImpersonationContext', () => ({
  useImpersonation: () => ({
    isImpersonating: false,
    impersonatedUser: null,
    originalUser: null,
    canImpersonate: true,
    startImpersonation: vi.fn(),
    endImpersonation: vi.fn(),
  }),
}))

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

describe('ImpersonationBanner', () => {
  it('renders nothing when not impersonating', () => {
    const { container } = render(<ImpersonationBanner />, {
      wrapper: createWrapper(),
    })
    expect(container.firstChild).toBeNull()
  })
})

describe('ImpersonationControls', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    company_id: 'comp1',
    phone: '',
    job_title: '',
    department: '',
    trade_type: 'general' as const,
    permissions: [],
    is_active: true,
    role: 'buyer' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('renders impersonation controls for admin', () => {
    render(<ImpersonationControls user={mockUser} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText(/impersonate/i)).toBeInTheDocument()
  })
})
