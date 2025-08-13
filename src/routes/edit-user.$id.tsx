import { createFileRoute, useParams } from '@tanstack/react-router'
import { useUserData } from '@/hooks/useUserData'
import { EditUser } from '@/components/EditUser'

export const Route = createFileRoute('/edit-user/$id')({
  component: EditUserPage,
})

function EditUserPage() {
  const { id: userId } = useParams({ from: '/edit-user/$id' })
  const { user, loading, error } = useUserData(userId)

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!user) return <div className="p-8">User not found.</div>

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <EditUser user={user} />
    </div>
  )
}
