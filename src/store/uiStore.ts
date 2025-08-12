import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, UIState } from '@/types/ui'

interface UIStore extends UIState {
  // UI actions
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setLoading: (loading: boolean) => void

  // Notification actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>,
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'light',
      isLoading: false,
      notifications: [],

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      openSidebar: () =>
        set({
          sidebarOpen: true,
        }),

      closeSidebar: () =>
        set({
          sidebarOpen: false,
        }),

      setTheme: (theme) =>
        set({
          theme,
        }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
        }
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        })),

      clearNotifications: () =>
        set({
          notifications: [],
        }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
)
