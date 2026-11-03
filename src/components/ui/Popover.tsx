import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface PopoverProps {
  label: string
  children: ReactNode
  panel: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Popover({
  label,
  children,
  panel,
  align = 'right',
  className = '',
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="btn"
      >
        {children}
      </button>
      {open && (
        <div
          id={panelId}
          className={`absolute top-[calc(100%+6px)] z-40 w-64 border border-line bg-surface p-3 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <p className="eyebrow mb-2">{label}</p>
          {panel}
        </div>
      )}
    </div>
  )
}
