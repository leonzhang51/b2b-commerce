import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionTimeoutModal } from '@/components/SessionTimeoutModal'
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner'
import { SecurityDashboard } from '@/components/SecurityDashboard'

// Mock the security store
const mockSecurityStore = {
  lastActivity: Date.now(),
  sessionStartTime: Date.now(),
  tokenLastRefreshed: Date.now(),
  loginAttempts: 0,
  isLocked: false,
  isSessionWarningVisible: false,
  timeUntilTimeout: 300000, // 5 minutes
  isEmailVerificationSent: false,
  refreshTimerId: null,
  sessionCheckTimerId: null,
  updateActivity: vi.fn(),
  extendSession: vi.fn(),
  dismissSessionWarning: vi.fn(),
  refreshToken: vi.fn(),
  sendEmailVerification: vi.fn(),
  startSessionMonitoring: vi.fn(),
  stopSessionMonitoring: vi.fn(),
  startTokenRefresh: vi.fn(),
  stopTokenRefresh: vi.fn(),
  resetSecurityContext: vi.fn(),
  setTimeUntilTimeout: vi.fn(),
}

vi.mock('@/store/securityStore', () => ({
  useSecurityStore: (selector?: any) => {
    if (selector) {
      return selector(mockSecurityStore)
    }
    return mockSecurityStore
  },
  useIsSessionWarningVisible: () => mockSecurityStore.isSessionWarningVisible,
  useIsSessionExpired: () => false,
  useTimeUntilTimeout: () => mockSecurityStore.timeUntilTimeout,
  useUpdateActivity: () => mockSecurityStore.updateActivity,
  useExtendSession: () => mockSecurityStore.extendSession,
  useDismissSessionWarning: () => mockSecurityStore.dismissSessionWarning,
  useRefreshToken: () => mockSecurityStore.refreshToken,
  useSendEmailVerification: () => mockSecurityStore.sendEmailVerification,
}))

// Mock the auth context
const mockAuthContext = {
  user: {
    id: 'test-user',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'admin',
    email_confirmed_at: new Date().toISOString(),
  },
  loading: false,
  signOut: vi.fn(),
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock audit logger
vi.mock('@/hooks/useAuditLog', () => ({
  useAuditLogger: () => ({
    createAuditLog: { mutate: vi.fn() },
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

describe('SessionTimeoutModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when session warning is not visible', () => {
    const { container } = render(<SessionTimeoutModal />, {
      wrapper: createWrapper(),
    })
    expect(container.firstChild).toBeNull()
  })

  it('renders when session warning is visible', () => {
    mockSecurityStore.isSessionWarningVisible = true
    render(<SessionTimeoutModal />, { wrapper: createWrapper() })
    expect(screen.getByText(/session timeout warning/i)).toBeInTheDocument()
    expect(
      screen.getByText(/your session is about to expire/i),
    ).toBeInTheDocument()
  })

  it('shows countdown timer', () => {
    mockSecurityStore.isSessionWarningVisible = true
    mockSecurityStore.timeUntilTimeout = 180000 // 3 minutes
    render(<SessionTimeoutModal />, { wrapper: createWrapper() })
    expect(screen.getByText(/time remaining/i)).toBeInTheDocument()
  })

  it('calls extendSession when Stay Signed In is clicked', async () => {
    mockSecurityStore.isSessionWarningVisible = true
    render(<SessionTimeoutModal />, { wrapper: createWrapper() })

    const staySignedInButton = screen.getByText(/stay signed in/i)
    fireEvent.click(staySignedInButton)

    await waitFor(() => {
      expect(mockSecurityStore.extendSession).toHaveBeenCalled()
    })
  })

  it('calls signOut when Sign Out Now is clicked', () => {
    mockSecurityStore.isSessionWarningVisible = true
    render(<SessionTimeoutModal />, { wrapper: createWrapper() })

    const signOutButton = screen.getByText(/sign out now/i)
    fireEvent.click(signOutButton)

    expect(mockAuthContext.signOut).toHaveBeenCalled()
  })
})

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when email is verified', () => {
    // Set user email as verified
    mockAuthContext.user.email_confirmed_at = new Date().toISOString()
    const { container } = render(<EmailVerificationBanner />, {
      wrapper: createWrapper(),
    })
    expect(container.firstChild).toBeNull()
  })

  it('renders when email is not verified', () => {
    // Set user email as not verified
    mockAuthContext.user.email_confirmed_at = null
    render(<EmailVerificationBanner />, { wrapper: createWrapper() })
    expect(
      screen.getByText(/please verify your email address/i),
    ).toBeInTheDocument()
    expect(screen.getByText(mockAuthContext.user.email)).toBeInTheDocument()
  })

  it('calls sendEmailVerification when Resend is clicked', async () => {
    mockAuthContext.user.email_confirmed_at = null
    render(<EmailVerificationBanner />, { wrapper: createWrapper() })

    const resendButton = screen.getByRole('button', { name: /resend/i })
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(mockSecurityStore.sendEmailVerification).toHaveBeenCalled()
    })
  })

  it('shows success message when verification email is sent', () => {
    mockAuthContext.user.email_confirmed_at = null
    mockSecurityStore.isEmailVerificationSent = true
    render(<EmailVerificationBanner />, { wrapper: createWrapper() })

    expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
  })

  it('can be dismissed', () => {
    mockAuthContext.user.email_confirmed_at = null
    render(<EmailVerificationBanner />, { wrapper: createWrapper() })

    const dismissButton = screen.getByLabelText(/dismiss verification banner/i)
    fireEvent.click(dismissButton)

    // After dismissing, the banner should not be visible
    expect(
      screen.queryByText(/please verify your email address/i),
    ).not.toBeInTheDocument()
  })
})

describe('SecurityDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user.role = 'admin'
  })

  it('renders security dashboard for admin users', () => {
    render(<SecurityDashboard />, { wrapper: createWrapper() })
    expect(screen.getByText(/security dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/session status/i)).toBeInTheDocument()
    expect(screen.getByText(/token status/i)).toBeInTheDocument()
    expect(screen.getByText(/email status/i)).toBeInTheDocument()
  })

  it('denies access for non-admin users', () => {
    mockAuthContext.user.role = 'buyer'
    render(<SecurityDashboard />, { wrapper: createWrapper() })
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(
      screen.getByText(/only administrators can access/i),
    ).toBeInTheDocument()
  })

  it('shows security configuration', () => {
    render(<SecurityDashboard />, { wrapper: createWrapper() })
    expect(screen.getByText(/security configuration/i)).toBeInTheDocument()
    expect(screen.getByText(/session management/i)).toBeInTheDocument()
    expect(screen.getByText(/token management/i)).toBeInTheDocument()
  })

  it('calls refreshToken when Refresh Token button is clicked', async () => {
    render(<SecurityDashboard />, { wrapper: createWrapper() })

    const refreshButton = screen.getByText(/refresh token/i)
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockSecurityStore.refreshToken).toHaveBeenCalled()
    })
  })

  it('shows email verification button when email is not verified', () => {
    mockAuthContext.user.email_confirmed_at = null
    render(<SecurityDashboard />, { wrapper: createWrapper() })

    expect(screen.getByText(/send verification/i)).toBeInTheDocument()
  })

  it('does not show email verification button when email is verified', () => {
    mockAuthContext.user.email_confirmed_at = new Date().toISOString()
    render(<SecurityDashboard />, { wrapper: createWrapper() })

    expect(screen.queryByText(/send verification/i)).not.toBeInTheDocument()
  })

  it('displays current session details', () => {
    render(<SecurityDashboard />, { wrapper: createWrapper() })
    expect(screen.getByText(/current session/i)).toBeInTheDocument()
    expect(screen.getByText(/session started/i)).toBeInTheDocument()
    expect(screen.getByText(/last activity/i)).toBeInTheDocument()
    expect(screen.getByText(/token last refreshed/i)).toBeInTheDocument()
  })
})
