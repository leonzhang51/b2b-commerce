import { useState } from 'react'
import type { User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateUser } from '@/hooks/useUpdateUser'

// Extended type for form fields that includes first_name and last_name
type EditableUser = User & {
  first_name?: string
  last_name?: string
}

interface EditUserProps {
  user: EditableUser
  onSave?: (user: EditableUser) => void
}

export function EditUser({ user, onSave }: EditUserProps) {
  const [form, setForm] = useState<EditableUser>(user)
  const { updateUser, loading, error, success } = useUpdateUser()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const updatedUser = await updateUser(form)
    if (updatedUser && onSave) {
      onSave(updatedUser as EditableUser)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
      <Input
        name="first_name"
        placeholder="First Name"
        value={form.first_name || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="last_name"
        placeholder="Last Name"
        value={form.last_name || ''}
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
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && (
        <div className="text-green-600 text-sm">Profile updated!</div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
