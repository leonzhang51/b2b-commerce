import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function Toasts() {
  const notifications = useUIStore((state) => state.notifications)
  const removeNotification = useUIStore((state) => state.removeNotification)

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [notifications, removeNotification])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded shadow text-white text-sm transition-all duration-300
            ${n.type === 'success' ? 'bg-green-600' : ''}
            ${n.type === 'error' ? 'bg-red-600' : ''}
            ${n.type === 'info' ? 'bg-blue-600' : ''}
            ${n.type === 'warning' ? 'bg-yellow-600 text-black' : ''}
          `}
          role="status"
          aria-live="polite"
        >
          {n.message}
        </div>
      ))}
    </div>
  )
}
