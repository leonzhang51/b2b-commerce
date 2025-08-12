import { useState } from 'react'
import type { User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

interface EditUserProps {
  user: User
  onSave?: (user: User) => void
}

export function EditUser({ user, onSave }: EditUserProps) {
  const [form, setForm] = useState<User>(user)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccess(false)
    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        company_id: form.company_id,
        phone: form.phone,
        job_title: form.job_title,
        department: form.department,
        trade_type: form.trade_type,
        permissions: form.permissions,
        is_active: form.is_active,
      })
      .eq('id', form.id)
      .select()
      .single()
    if (updateError) {
      setErrorMsg(updateError.message)
    } else {
      setSuccess(true)
      if (onSave && data) onSave(data as User)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
      <Input
        name="first_name"
        placeholder="First Name"
        value={form.first_name}
        onChange={handleChange}
        required
      />
      <Input
        name="last_name"
        placeholder="Last Name"
        value={form.last_name}
        onChange={handleChange}
        required
      />
      <Input
        name="company_id"
        placeholder="Company ID"
        value={form.company_id}
        onChange={handleChange}
      />
      <Input
        name="phone"
        placeholder="Phone"
        value={form.phone || ''}
        onChange={handleChange}
      />
      <Input
        name="job_title"
        placeholder="Job Title"
        value={form.job_title || ''}
        onChange={handleChange}
      />
      <Input
        name="department"
        placeholder="Department"
        value={form.department || ''}
        onChange={handleChange}
      />
      <label className="block text-sm font-medium">Trade Type</label>
      <select
        name="trade_type"
        className="w-full border rounded px-2 py-1"
        value={form.trade_type}
        onChange={handleChange}
      >
        <option value="contractor">Contractor</option>
        <option value="plumber">Plumber</option>
        <option value="electrician">Electrician</option>
        <option value="hvac">HVAC</option>
        <option value="general">General</option>
      </select>
      <label className="block text-sm font-medium">
        Permissions (comma separated)
      </label>
      <Input
        name="permissions"
        placeholder="admin,manager"
        value={
          Array.isArray(form.permissions) ? form.permissions.join(',') : ''
        }
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            permissions: e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          }))
        }
      />
      <label className="block text-sm font-medium">Active</label>
      <select
        name="is_active"
        className="w-full border rounded px-2 py-1"
        value={form.is_active ? 'true' : 'false'}
        onChange={(e) =>
          setForm((f) => ({ ...f, is_active: e.target.value === 'true' }))
        }
      >
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
      {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
      {success && (
        <div className="text-green-600 text-sm">Profile updated!</div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
