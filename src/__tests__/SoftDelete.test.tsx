import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeletedEntitiesManager } from '@/components/DeletedEntitiesManager'

describe('DeletedEntitiesManager', () => {
  it('renders deleted entities manager', () => {
    render(<DeletedEntitiesManager entityType="user" />)
    expect(screen.getByText(/deleted users/i)).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    render(<DeletedEntitiesManager entityType="user" title="Custom Title" />)
    expect(screen.getByText(/custom title/i)).toBeInTheDocument()
  })
})
