import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/edit-user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/edit-user"!</div>
}
