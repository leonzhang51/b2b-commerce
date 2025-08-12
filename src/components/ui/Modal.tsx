import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
          style={{
            background: 'rgba(30,30,40,0.25)',
            backdropFilter: 'blur(12px) saturate(1.5)',
          }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/70 dark:bg-zinc-900/70 shadow-2xl p-8 border border-white/30 backdrop-blur-2xl"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(16px) saturate(1.8)',
          }}
        >
          {title && (
            <Dialog.Title className="text-xl font-bold mb-4">
              {title}
            </Dialog.Title>
          )}
          {children}
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl">
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
