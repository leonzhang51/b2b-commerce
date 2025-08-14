import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AdminDashboard } from '@/components/AdminDashboard'

describe('AdminDashboard', () => {
  const mockOnSectionChange = vi.fn()

  beforeEach(() => {
    mockOnSectionChange.mockClear()
  })

  it('renders admin dashboard', () => {
    render(
      <AdminDashboard
        activeSection="overview"
        onSectionChange={mockOnSectionChange}
      />,
    )
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
    expect(
      screen.getByText(/manage your b2b commerce platform/i),
    ).toBeInTheDocument()
  })

  it('shows overview stats when active section is overview', () => {
    render(
      <AdminDashboard
        activeSection="overview"
        onSectionChange={mockOnSectionChange}
      />,
    )
    expect(screen.getByText(/total users/i)).toBeInTheDocument()
    expect(screen.getAllByText(/companies/i)).toHaveLength(2) // One in stats, one in sections
  })

  it('calls onSectionChange when section is clicked', () => {
    render(
      <AdminDashboard
        activeSection="overview"
        onSectionChange={mockOnSectionChange}
      />,
    )

    const usersSection = screen.getByText(/user management/i).closest('button')
    expect(usersSection).toBeTruthy()

    fireEvent.click(usersSection!)
    expect(mockOnSectionChange).toHaveBeenCalledWith('users')
  })

  it('highlights active section', () => {
    render(
      <AdminDashboard
        activeSection="users"
        onSectionChange={mockOnSectionChange}
      />,
    )

    const usersSection = screen.getByText(/user management/i).closest('button')
    expect(usersSection).toHaveClass('border-blue-500')
  })
})
