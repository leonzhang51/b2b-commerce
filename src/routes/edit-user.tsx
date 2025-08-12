import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/edit-user')({
  component: () => <Navigate to="/user-admin" />,
})
