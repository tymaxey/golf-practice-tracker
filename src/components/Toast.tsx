import { useEffect } from 'react'

type ToastProps = {
  message: string | null
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, onDismiss, durationMs = 1800 }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(t)
  }, [message, durationMs, onDismiss])

  if (!message) return null
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center"
    >
      <div className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-ink-950 shadow-lg">
        {message}
      </div>
    </div>
  )
}
