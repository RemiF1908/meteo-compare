import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'

interface ErrorBannerProps {
  message: string
  onRetry: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-error bg-error/5 px-3 py-2 text-xs text-error">
      <p className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {message}
      </p>
      <Button onClick={onRetry} className="text-error">
        <RefreshCw className="h-3 w-3" />
        Réessayer
      </Button>
    </div>
  )
}
