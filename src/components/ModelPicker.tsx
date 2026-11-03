import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import {
  MODELS,
  MODEL_BY_ID,
  MODEL_GROUPS,
  defaultModelIdsForLocation,
} from '../data/models'
import type { ModelStatus } from '../types'
import { Dialog } from './ui/Dialog'
import { Button } from './ui/Button'
import { IconButton } from './ui/IconButton'

interface ModelRailProps {
  selected: string[]
  statuses: Record<string, ModelStatus>
  loading: boolean
  onRemove: (modelId: string) => void
  onOpen: () => void
}

const STATUS_LABEL: Record<ModelStatus, string> = {
  ok: 'Disponible',
  'no-data': 'Aucune donnée',
  'out-of-domain': 'Hors domaine',
  error: 'Erreur',
}

const STATUS_DOT: Record<ModelStatus, string> = {
  ok: 'bg-ok',
  'no-data': 'bg-faint',
  'out-of-domain': 'bg-warn',
  error: 'bg-error',
}

function StatusDot({ status }: { status?: ModelStatus }) {
  if (!status) {
    return <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
  }
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`}
      title={STATUS_LABEL[status]}
      aria-label={STATUS_LABEL[status]}
    />
  )
}

export function ModelRail({
  selected,
  statuses,
  loading,
  onRemove,
  onOpen,
}: ModelRailProps) {
  return (
    <section aria-labelledby="models-title">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
        <div>
          <h2 id="models-title" className="font-serif text-base">
            Modèles
          </h2>
          <p className="data mt-0.5 text-[10px] text-muted">
            {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
            {loading ? ' · chargement' : ''}
          </p>
        </div>
        <Button onClick={onOpen}>
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      {selected.length === 0 ? (
        <div className="mt-3 border border-dashed border-line px-3 py-4 text-xs text-muted">
          Aucun modèle sélectionné. Ajoutez-en un pour lancer la comparaison.
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {selected.map((modelId) => {
            const model = MODEL_BY_ID.get(modelId)
            const status = statuses[modelId]
            return (
              <li key={modelId} className="group flex items-center gap-2 py-2">
                <span
                  className="h-5 w-[3px] shrink-0"
                  style={{ backgroundColor: model?.color ?? '#d64a2f' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {model?.label ?? modelId}
                  </p>
                  <p className="data mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
                    <StatusDot status={status} />
                    {status ? STATUS_LABEL[status] : 'en attente'}
                    {model && (
                      <>
                        <span className="text-line-strong">·</span>
                        {model.resolution}
                        <span className="text-line-strong">·</span>
                        {model.forecastDays} j
                      </>
                    )}
                  </p>
                </div>
                <IconButton
                  label={`Retirer ${model?.label ?? modelId}`}
                  onClick={() => onRemove(modelId)}
                  className="h-7 w-7 border-transparent bg-transparent opacity-60 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </IconButton>
              </li>
            )
          })}
        </ul>
      )}

      {selected.length > 20 && (
        <p className="mt-3 border-l-2 border-warn pl-2 text-[11px] text-warn">
          Sélection importante : les requêtes sont envoyées par lots de 6.
        </p>
      )}
    </section>
  )
}

interface ModelDialogProps {
  open: boolean
  onClose: () => void
  selected: string[]
  onChange: (modelIds: string[]) => void
  statuses: Record<string, ModelStatus>
  countryCode?: string
}

export function ModelDialog({
  open,
  onClose,
  selected,
  onChange,
  statuses,
  countryCode,
}: ModelDialogProps) {
  const [draft, setDraft] = useState<string[]>(selected)
  const [filter, setFilter] = useState('')

  const draftSet = useMemo(() => new Set(draft), [draft])

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return MODEL_GROUPS.map((group) => ({
      group,
      models: MODELS.filter(
        (model) =>
          model.group === group &&
          (needle === '' ||
            model.label.toLowerCase().includes(needle) ||
            model.id.toLowerCase().includes(needle) ||
            model.provider.toLowerCase().includes(needle) ||
            model.region.toLowerCase().includes(needle)),
      ),
    })).filter((entry) => entry.models.length > 0)
  }, [filter])

  function toggle(modelId: string) {
    setDraft((current) =>
      current.includes(modelId)
        ? current.filter((id) => id !== modelId)
        : [...current, modelId],
    )
  }

  function toggleGroup(group: string) {
    const groupIds = MODELS.filter((model) => model.group === group).map(
      (model) => model.id,
    )
    const allSelected = groupIds.every((id) => draftSet.has(id))
    setDraft((current) =>
      allSelected
        ? current.filter((id) => !groupIds.includes(id))
        : [...new Set([...current, ...groupIds])],
    )
  }

  function apply() {
    onChange(draft)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choisir les modèles"
      description="Comparez les modèles globaux et régionaux disponibles pour ce point."
      wide
      variant="sheet"
      footer={
        <>
          <span className="data mr-auto text-[11px] text-muted">
            {draft.length} sélectionné{draft.length > 1 ? 's' : ''}
          </span>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={apply}>
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
          placeholder="Rechercher un modèle, un fournisseur, une région…"
          className="field pl-9"
          aria-label="Rechercher un modèle"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button
          onClick={() => setDraft(defaultModelIdsForLocation(countryCode))}
        >
          Recommandés
        </Button>
        <Button
          onClick={() =>
            setDraft(
              MODELS.filter((model) => model.region === 'global').map(
                (model) => model.id,
              ),
            )
          }
        >
          Globaux
        </Button>
        <Button onClick={() => setDraft(MODELS.map((model) => model.id))}>
          Tout
        </Button>
        <Button variant="ghost" onClick={() => setDraft([])}>
          Effacer
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {grouped.map(({ group, models }) => (
          <div key={group}>
            <div className="mb-1 flex items-center justify-between gap-2 border-b border-line pb-1">
              <h3 className="eyebrow">{group}</h3>
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="text-[10px] text-accent hover:underline"
              >
                {models.every((model) => draftSet.has(model.id))
                  ? 'retirer'
                  : 'ajouter'}
              </button>
            </div>
            <ul className="grid gap-x-4 sm:grid-cols-2">
              {models.map((model) => (
                <li key={model.id}>
                  <label className="flex cursor-pointer items-center gap-2 border-b border-line/60 py-1.5 transition hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={draftSet.has(model.id)}
                      onChange={() => toggle(model.id)}
                      className="h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
                    />
                    <span
                      className="h-2.5 w-[3px] shrink-0"
                      style={{ backgroundColor: model.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {model.label}
                    </span>
                    <span className="data shrink-0 text-[10px] text-faint">
                      {model.forecastDays} j
                    </span>
                    <StatusDot status={statuses[model.id]} />
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="py-6 text-center text-xs text-muted">
            Aucun modèle ne correspond à cette recherche.
          </p>
        )}
      </div>
    </Dialog>
  )
}
