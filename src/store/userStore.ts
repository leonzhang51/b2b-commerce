import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types/auth'

interface UserState {
  user: AuthUser | null
  isAuthenticated: boolean
}

interface UserActions {
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

interface UserStore extends UserState, UserActions {}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          })
        }
      },
    }),
    {
      name: 'user-store',
      // Only persist essential user data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Computed selectors for better performance
export const useCurrentUser = () => useUserStore((state) => state.user)
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated)
export const useUserRole = () => useUserStore((state) => state.user?.role)
export const useUserPermissions = () =>
  useUserStore((state) => state.user?.permissions || [])
