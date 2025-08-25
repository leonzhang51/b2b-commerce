import '@testing-library/jest-dom'

// Provide safe test defaults for environment variables used by libs like supabase.
if (!process.env.VITE_SUPABASE_URL)
  process.env.VITE_SUPABASE_URL = 'http://localhost'
if (!process.env.VITE_SUPABASE_ANON_KEY)
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
