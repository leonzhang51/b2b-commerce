export interface UIState {
  readonly sidebarOpen: boolean
  readonly theme: 'light' | 'dark'
  readonly isLoading: boolean
  readonly notifications: Array<Notification>
}

export interface Notification {
  readonly id: string
  readonly type: 'success' | 'error' | 'warning' | 'info'
  readonly message: string
  readonly timestamp: Date
}
