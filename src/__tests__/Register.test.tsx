import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '../routes/register'
import { supabase } from '@/lib/supabase'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  createFileRoute: vi.fn((_path: string) => (config: any) => config),
}))

vi.mock('@/lib/supabase', () => {
  const signUp = vi.fn()
  const from = vi.fn(() => ({
    insert: vi.fn(() => ({ error: null })),
  }))
  return {
    supabase: {
      auth: { signUp },
      from,
    },
  }
})

beforeEach(() => {
  vi.resetAllMocks()
})

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

  it('submits registration successfully and shows success message', async () => {
    ;(supabase.auth.signUp as any).mockResolvedValueOnce({
      error: null,
      data: { user: { id: 'user-1', email: 'new@example.com' } },
    })

    render(<RegisterPage />)

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'New' },
    })
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: 'User' },
    })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/check your email to confirm registration/i),
      ).toBeInTheDocument()
    })

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'Secret123!',
      options: expect.objectContaining({ data: expect.any(Object) }),
    })
  })

  it('shows error message when sign up fails', async () => {
    ;(supabase.auth.signUp as any).mockResolvedValueOnce({
      error: { message: 'Email already in use' },
      data: { user: null },
    })

    render(<RegisterPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'exists@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Existing' },
    })
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: 'User' },
    })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
    })
  })

  it('shows profile insertion error message if profile save fails', async () => {
    ;(supabase.auth.signUp as any).mockResolvedValueOnce({
      error: null,
      data: { user: { id: 'user-2', email: 'profile@example.com' } },
    })

    // Make the profile insert return an error for this test only
    const insertError = { message: 'profile fail' }
    ;(supabase.from as any).mockReturnValueOnce({
      insert: vi.fn(() => ({ error: insertError })),
    })

    render(<RegisterPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'profile@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Profile' },
    })
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: 'Error' },
    })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/registered, but failed to save profile/i),
      ).toBeInTheDocument()
    })
  })
})
