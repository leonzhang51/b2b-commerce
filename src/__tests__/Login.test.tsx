import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginPage } from '../routes/login'

describe('Login Page', () => {
  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('displays the auth form component', () => {
    render(<LoginPage />)
    // The LoginPage renders an AuthForm component
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
