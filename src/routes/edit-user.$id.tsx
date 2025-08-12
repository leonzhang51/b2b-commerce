import { createFileRoute, useParams } from '@tanstack/react-router'

import { useEffect, useState } from 'react'
import type { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { EditUser } from '@/components/EditUser'

export const Route = createFileRoute('/edit-user/$id')({
  component: EditUserPage,
})

function EditUserPage() {
  const { id: userId } = useParams({ from: '/edit-user/$id' })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      setErrorMsg(null)
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (fetchError) {
        setErrorMsg(fetchError.message)
      } else {
        setUser(data as User)
      }
      setLoading(false)
    }
    fetchUser()
  }, [userId])

  if (loading) return <div className="p-8">Loading...</div>
  if (errorMsg) return <div className="p-8 text-red-500">{errorMsg}</div>
  if (!user) return <div className="p-8">User not found.</div>

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <EditUser user={user} onSave={setUser} />
    </div>
  )
}
