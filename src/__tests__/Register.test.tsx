import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '../routes/register'

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

const mockRegister = vi.fn()

vi.mock('@/hooks/useRegisterUser', () => ({
  useRegisterUser: () => ({
    register: mockRegister,
    loading: mockHookState.loading,
    error: mockHookState.error,
    success: mockHookState.success,
  }),
}))

beforeEach(() => {
  vi.resetAllMocks()
  mockRegister.mockReset()
  // Reset mock state to defaults
  mockHookState.loading = false
  mockHookState.error = null
  mockHookState.success = false
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

  it('submits registration and calls register hook', async () => {
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
      expect(mockRegister).toHaveBeenCalledTimes(1)
    })
    expect(mockRegister.mock.calls[0][0]).toMatchObject({
      email: 'new@example.com',
      password: 'Secret123!',
      firstName: 'New',
      lastName: 'User',
    })
  })

  it('shows success message when hook returns success state', () => {
    // Set mock state to success
    mockHookState.success = true

    render(<RegisterPage />)
    expect(
      screen.getByText(/check your email to confirm registration/i),
    ).toBeInTheDocument()
  })

  it('shows loading state when registering', () => {
    // Set loading state
    mockHookState.loading = true
    mockHookState.error = null
    mockHookState.success = false

    render(<RegisterPage />)

    // Button should show loading text and be disabled
    const button = screen.getByRole('button', { name: /registering.../i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('shows error message when hook returns error state', () => {
    // Set mock state to error
    mockHookState.error = 'Email already in use'
    mockHookState.loading = false
    mockHookState.success = false

    render(<RegisterPage />)

    // Fill out form and submit
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

    expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
  })

  it('shows profile save error message from hook', () => {
    // Set mock state to profile error
    mockHookState.error = 'Registered, but failed to save profile: profile fail'
    mockHookState.loading = false
    mockHookState.success = false

    render(<RegisterPage />)

    // Fill out form and submit
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

    expect(
      screen.getByText(/registered, but failed to save profile/i),
    ).toBeInTheDocument()
  })
})
