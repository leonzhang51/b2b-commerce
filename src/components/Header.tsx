import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = user && user.role === 'admin'

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/demo/start/server-funcs', label: 'Start - Server Functions' },
    { to: '/demo/start/api-request', label: 'Start - API Request' },
    { to: '/demo/db-chat', label: 'DB Chat' },
    { to: '/demo/form/simple', label: 'Simple Form' },
    { to: '/demo/form/address', label: 'Address Form' },
    { to: '/demo/mcp-todos', label: 'MCP' },
    { to: '/demo/tanstack-query', label: 'TanStack Query' },
    { to: '/demo/table', label: 'TanStack Table' },
  ]
  if (isAdmin) {
    navLinks.push({ to: '/user-admin', label: 'User Admin' })
  }

  return (
    <header className="p-2 bg-white text-black flex items-center justify-between border-b">
      <div className="flex items-center">
        <button
          className="md:hidden p-2 mr-2"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-bold text-lg hidden md:inline">B2B Commerce</span>
      </div>
      <nav
        className={`flex-col gap-2 items-center w-full md:w-auto md:flex-row md:flex ${menuOpen ? 'flex' : 'hidden'} md:!flex`}
      >
        {navLinks.map((link) => (
          <div key={link.to} className="px-2 font-bold">
            <Link to={link.to}>{link.label}</Link>
          </div>
        ))}
        {user && (
          <div className="px-2 text-sm text-gray-600">
            {user.email} ({user.role})
          </div>
        )}
      </nav>
    </header>
  )
}
