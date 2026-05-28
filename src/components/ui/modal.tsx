'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {title && (
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold text-white">{title}</Dialog.Title>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
