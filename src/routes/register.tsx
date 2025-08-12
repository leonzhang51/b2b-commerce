import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [tradeType, setTradeType] = useState('contractor')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const user_metadata = {
      first_name: firstName,
      last_name: lastName,
      company,
      phone,
      job_title: jobTitle,
      department,
      trade_type: tradeType,
    }
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: user_metadata },
    })
    if (result.error) {
      setError(result.error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xs w-full">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <label className="block text-sm font-medium">Trade Type</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={tradeType}
          onChange={(e) => setTradeType(e.target.value)}
        >
          <option value="contractor">Contractor</option>
          <option value="plumber">Plumber</option>
          <option value="electrician">Electrician</option>
          <option value="hvac">HVAC</option>
          <option value="general">General</option>
        </select>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && (
          <div className="text-green-600 text-sm">
            Check your email to confirm registration.
          </div>
        )}
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
      <div className="mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})
