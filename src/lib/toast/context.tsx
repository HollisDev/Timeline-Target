'use client'

import { createContext, ReactNode, useCallback, useContext } from 'react'
import { toast } from 'sonner'

type ToastOptions = {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning' | 'action'
  action?: {
    label: string
    onClick: () => void
  }
  description?: string
}

interface ToastContextType {
  addToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const addToast = useCallback((options: ToastOptions) => {
    const { message, type = 'info', action, description } = options

    switch (type) {
      case 'success':
        toast.success(message, { description })
        break
      case 'error':
        toast.error(message, { description })
        break
      case 'warning':
        toast.warning(message, { description })
        break
      case 'action':
        if (action) {
          toast(message, {
            description,
            action: {
              label: action.label,
              onClick: action.onClick,
            },
          })
        } else {
          toast.info(message, { description })
        }
        break
      default:
        toast.info(message, { description })
        break
    }
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
