import { CalendarRange, Layers, MapPin, SlidersHorizontal } from 'lucide-react'

export type ControlPanel = 'location' | 'models' | 'parameters' | 'period'

interface MobileControlBarProps {
  modelCount: number
  parameterCount: number
  days: number
  onOpen: (panel: ControlPanel) => void
}

const ITEMS = [
  { panel: 'location' as const, label: 'Lieu', icon: MapPin },
  { panel: 'models' as const, label: 'Modèles', icon: Layers },
  { panel: 'parameters' as const, label: 'Paramètres', icon: SlidersHorizontal },
  { panel: 'period' as const, label: 'Période', icon: CalendarRange },
]

export function MobileControlBar({
  modelCount,
  parameterCount,
  days,
  onOpen,
}: MobileControlBarProps) {
  return (
    <nav
      aria-label="Réglages de comparaison"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {ITEMS.map(({ panel, label, icon: Icon }) => {
          const detail =
            panel === 'models'
              ? String(modelCount)
              : panel === 'parameters'
                ? String(parameterCount)
                : panel === 'period'
                  ? `${days} j`
                  : null
          return (
            <button
              key={panel}
              type="button"
              onClick={() => onOpen(panel)}
              className="flex min-h-14 flex-col items-center justify-center gap-1 border-r border-line text-[10px] text-muted last:border-r-0 active:bg-surface-2"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="flex items-center gap-1">
                {label}
                {detail && <span className="data text-faint">{detail}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
