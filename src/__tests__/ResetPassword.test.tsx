import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetPasswordPage } from '../routes/reset-password'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  createFileRoute: vi.fn((_path: string) => (config: any) => config),
}))

// Create a mutable mock state object that tests can modify
const mockHookState = {
  loading: false,
  error: null as string | null,
  success: false,
}

const mockResetPassword = vi.fn()

vi.mock('@/hooks/useResetPassword', () => ({
  useResetPassword: () => ({
    resetPassword: mockResetPassword,
    loading: mockHookState.loading,
    error: mockHookState.error,
    success: mockHookState.success,
  }),
}))

beforeEach(() => {
  vi.resetAllMocks()
  mockResetPassword.mockReset()
  // Reset mock state to defaults
  mockHookState.loading = false
  mockHookState.error = null
  mockHookState.success = false
})

describe('Reset Password Page', () => {
  it('renders the reset password form', () => {
    render(<ResetPasswordPage />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send reset link/i }),
    ).toBeInTheDocument()
  })

  it('submits email and shows success message', async () => {
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledTimes(1)
    })
    expect(mockResetPassword).toHaveBeenCalledWith('user@example.com')
  })

  it('shows success message when hook returns success state', () => {
    // Set mock state to success
    mockHookState.success = true

    render(<ResetPasswordPage />)
    expect(
      screen.getByText(/check your email for a password reset link/i),
    ).toBeInTheDocument()
  })

  it('shows error when hook returns error state', () => {
    // Set mock state to error
    mockHookState.error = 'No user found'

    render(<ResetPasswordPage />)
    expect(screen.getByText(/no user found/i)).toBeInTheDocument()
  })

  it('shows loading state when hook is loading', () => {
    // Set mock state to loading
    mockHookState.loading = true

    render(<ResetPasswordPage />)
    const button = screen.getByRole('button', { name: /sending.../i })
    expect(button).toBeDisabled()
  })
})
