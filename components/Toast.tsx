'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; type: ToastType }
type AddToast = (msg: string, type?: ToastType) => void

const ToastCtx = createContext<AddToast>(() => {})
export const useToast = () => useContext(ToastCtx)

const icons: Record<ToastType, string> = { success: '✓', error: '✕', info: 'ℹ' }
const colors: Record<ToastType, string> = {
  success: 'border-neon-green/50 text-neon-green',
  error:   'border-red-500/50 text-red-400',
  info:    'border-white/20 text-white/80',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`glass px-5 py-3 flex items-center gap-3 text-sm font-medium border ${colors[t.type]} pointer-events-auto min-w-[240px]`}
            >
              <span>{icons[t.type]}</span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
