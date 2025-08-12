import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '../routes/register'

import type { Mock } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  createFileRoute: vi.fn((_path: string) => (config: any) => config),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  },
}))

describe('Register Page', () => {
  it('renders the registration form', () => {
    render(<RegisterPage />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /register/i }),
    ).toBeInTheDocument()
  })

  it('displays form fields for user information', () => {
    render(<RegisterPage />)
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/company/i)).toBeInTheDocument()
  })
})
