import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetPasswordPage } from '../routes/reset-password'
import { supabase } from '@/lib/supabase'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  createFileRoute: vi.fn((_path: string) => (config: any) => config),
}))

vi.mock('@/lib/supabase', () => {
  const resetPasswordForEmail = vi.fn(() => Promise.resolve({ error: null }))
  return {
    supabase: {
      auth: { resetPasswordForEmail },
    },
  }
})

beforeEach(() => {
  vi.resetAllMocks()
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
      expect(
        screen.getByText(/check your email for a password reset link/i),
      ).toBeInTheDocument()
    })
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
    )
  })

  it('shows error when reset request fails', async () => {
    ;(supabase.auth.resetPasswordForEmail as any).mockResolvedValueOnce({
      error: { message: 'No user found' },
    })
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'missing@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/no user found/i)).toBeInTheDocument()
    })
  })
})
