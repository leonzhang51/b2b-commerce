import { createFileRoute } from '@tanstack/react-router'
import { B2BCommercePage } from '@/components/B2BCommercePage'
import { ClientOnly } from '@/components/ClientOnly'

function IndexComponent() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading B2B Commerce Platform...</p>
          </div>
        </div>
      }
    >
      <B2BCommercePage />
    </ClientOnly>
  )
}

export const Route = createFileRoute('/')({
  component: IndexComponent,
})
