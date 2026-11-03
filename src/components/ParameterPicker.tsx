import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import {
  PARAMETERS_BY_MODE,
  PARAMETER_GROUPS,
} from '../data/parameters'
import type { ParameterInfo, TimeMode } from '../types'
import { Dialog } from './ui/Dialog'
import { Button } from './ui/Button'

const MAX_PARAMETERS = 6

interface ParameterTabsProps {
  parameters: ParameterInfo[]
  activeParameterId: string
  onChange: (parameterId: string) => void
  onOpen: () => void
}

export function ParameterTabs({
  parameters,
  activeParameterId,
  onChange,
  onOpen,
}: ParameterTabsProps) {
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto pb-0.5">
      <div className="flex min-w-0 items-center gap-1" role="tablist">
        {parameters.map((parameter) => (
          <button
            key={parameter.id}
            type="button"
            role="tab"
            aria-selected={parameter.id === activeParameterId}
            onClick={() => onChange(parameter.id)}
            className={`shrink-0 border-b-2 px-2 py-1.5 text-xs font-medium transition ${
              parameter.id === activeParameterId
                ? 'border-accent text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {parameter.shortLabel}
            {parameter.unit && (
              <span className="data ml-1 text-[10px] text-faint">
                {parameter.unit}
              </span>
            )}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center border border-line text-muted transition hover:border-line-strong hover:text-ink"
        aria-label="Ajouter un paramètre"
        title="Ajouter un paramètre"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

interface ParameterDialogProps {
  open: boolean
  onClose: () => void
  mode: TimeMode
  selected: string[]
  onChange: (parameterIds: string[]) => void
}

export function ParameterDialog({
  open,
  onClose,
  mode,
  selected,
  onChange,
}: ParameterDialogProps) {
  const [draft, setDraft] = useState<string[]>(selected)
  const [filter, setFilter] = useState('')

  const draftSet = useMemo(() => new Set(draft), [draft])

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return PARAMETER_GROUPS[mode]
      .map((group) => ({
        group,
        parameters: PARAMETERS_BY_MODE[mode].filter(
          (parameter) =>
            parameter.group === group &&
            (needle === '' ||
              parameter.label.toLowerCase().includes(needle) ||
              parameter.id.toLowerCase().includes(needle)),
        ),
      }))
      .filter((entry) => entry.parameters.length > 0)
  }, [mode, filter])

  function toggle(parameterId: string) {
    setDraft((current) => {
      if (current.includes(parameterId)) {
        return current.filter((id) => id !== parameterId)
      }
      if (current.length >= MAX_PARAMETERS) return current
      return [...current, parameterId]
    })
  }

  function apply() {
    if (draft.length === 0) return
    onChange(draft)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choisir les paramètres"
      description={`Comparez jusqu’à ${MAX_PARAMETERS} paramètres. Ils apparaîtront en onglets au-dessus du graphique.`}
      variant="sheet"
      footer={
        <>
          <span className="data mr-auto text-[11px] text-muted">
            {draft.length}/{MAX_PARAMETERS}
          </span>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={apply} disabled={draft.length === 0}>
            Appliquer
          </Button>
        </>
      }
    >
      <div className="relative">
        <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-faint" />
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Rechercher un paramètre…"
          className="field pl-9"
          aria-label="Rechercher un paramètre"
        />
      </div>

      {draft.length >= MAX_PARAMETERS && (
        <p className="mt-2 border-l-2 border-warn pl-2 text-[11px] text-warn">
          Maximum atteint. Retirez un paramètre pour en ajouter un autre.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {grouped.map(({ group, parameters }) => (
          <div key={group}>
            <h3 className="eyebrow mb-1 border-b border-line pb-1">{group}</h3>
            <ul className="grid gap-x-4 sm:grid-cols-2">
              {parameters.map((parameter) => {
                const checked = draftSet.has(parameter.id)
                const disabled =
                  !checked && draft.length >= MAX_PARAMETERS
                return (
                  <li key={parameter.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-2 border-b border-line/60 py-1.5 transition hover:bg-surface-2 ${
                        disabled ? 'cursor-not-allowed opacity-45' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(parameter.id)}
                        className="h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {parameter.label}
                      </span>
                      {parameter.unit && (
                        <span className="data shrink-0 text-[10px] text-faint">
                          {parameter.unit}
                        </span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="py-6 text-center text-xs text-muted">
            Aucun paramètre ne correspond à cette recherche.
          </p>
        )}
      </div>
    </Dialog>
  )
}
