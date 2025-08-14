import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CartButton } from '@/components/CartComponents'
import { ProductSearch } from '@/components/ProductSearch'

import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isAdmin = user && user.role === 'admin'

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Optionally: trigger navigation or global search state here
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/demo/db-chat', label: 'DB Chat' },
  ]
  if (isAdmin) {
    navLinks.push({ to: '/user-admin', label: 'User Admin' })
  }

  return (
    <header className="p-2 bg-white text-black flex items-center justify-between border-b">
      <div className="flex items-center flex-1 min-w-0">
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
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            B2B Commerce Platform
          </h1>
          <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            Beta
          </span>
        </Link>
        <div className="flex-1 max-w-lg mx-8">
          <ProductSearch
            onSearch={handleSearch}
            placeholder="Search tools, materials, equipment..."
          />
        </div>
      </div>
      <nav
        className={`flex-col gap-2 items-center md:w-auto md:flex-row md:flex ${menuOpen ? 'flex' : 'hidden'} md:!flex`}
      >
        {navLinks.map((link) => (
          <div key={link.to} className="px-1 font-regular text-md">
            <Link to={link.to}>{link.label}</Link>
          </div>
        ))}
        <div className="flex items-center gap-2 px-2">
          <CartButton />
          <Link
            to="/cart"
            className="text-blue-600 hover:underline font-medium"
          >
            View Cart
          </Link>
          {user ? (
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              onClick={signOut}
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
