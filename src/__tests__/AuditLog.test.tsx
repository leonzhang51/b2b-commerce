import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuditLogViewer } from '@/components/AuditLogViewer'

describe('AuditLogViewer', () => {
  it('renders audit log viewer', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText(/audit logs/i)).toBeInTheDocument()
  })
})
