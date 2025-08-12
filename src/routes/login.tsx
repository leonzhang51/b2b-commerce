import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/AuthForm'

export function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <AuthForm />
    </main>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
