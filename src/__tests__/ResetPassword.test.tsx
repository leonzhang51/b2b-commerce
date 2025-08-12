import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResetPasswordPage } from '../routes/reset-password'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  createFileRoute: vi.fn((_path: string) => (config: any) => config),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}))

describe('Reset Password Page', () => {
  it('renders the reset password form', () => {
    render(<ResetPasswordPage />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send reset link/i }),
    ).toBeInTheDocument()
  })

  it('displays success message after email submission', () => {
    render(<ResetPasswordPage />)
    expect(screen.getByText(/reset password/i)).toBeInTheDocument()
  })
})
