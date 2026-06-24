import { useEffect, useState } from 'react'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  open: boolean
  onExtend: () => void
  onSignOut: () => void
}

const COUNTDOWN_SECONDS = 5 * 60  // 5 minutes matching the WARNING_MS gap

export default function SessionTimeoutModal({ open, onExtend, onSignOut }: Props) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (!open) {
      setSeconds(COUNTDOWN_SECONDS)
      return
    }

    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open])

  if (!open) return null

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Sesión por expirar
        </h2>
        <p className="mb-1 text-sm text-muted-foreground">
          Tu sesión cerrará por inactividad en:
        </p>
        <p className="mb-5 text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
          {timeStr}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onExtend}
            className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Continuar sesión
          </Button>
          <Button
            onClick={onSignOut}
            variant="outline"
            className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
