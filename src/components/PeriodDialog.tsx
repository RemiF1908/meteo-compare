import { useState } from 'react'
import type { TimeMode, UnitSettings } from '../types'
import { Dialog } from './ui/Dialog'
import { Button } from './ui/Button'
import { SegmentedControl } from './ui/SegmentedControl'

interface PeriodDialogProps {
  open: boolean
  onClose: () => void
  mode: TimeMode
  days: number
  units: UnitSettings
  onApply: (mode: TimeMode, days: number, units: UnitSettings) => void
}

export function PeriodDialog({
  open,
  onClose,
  mode,
  days,
  units,
  onApply,
}: PeriodDialogProps) {
  const [draftMode, setDraftMode] = useState(mode)
  const [draftDays, setDraftDays] = useState(days)
  const [draftUnits, setDraftUnits] = useState(units)

  function apply() {
    onApply(draftMode, draftDays, draftUnits)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Période & unités"
      description="Le changement de mode réinitialise les paramètres sélectionnés."
      variant="sheet"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={apply}>
            Appliquer
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="eyebrow mb-1.5">Pas de temps</p>
          <SegmentedControl
            label="Pas de temps"
            value={draftMode}
            onChange={setDraftMode}
            options={[
              { value: 'hourly', label: 'Horaire' },
              { value: 'daily', label: 'Journalier' },
            ]}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="eyebrow">Horizon</p>
            <span className="data text-xs">
              {draftDays} jour{draftDays > 1 ? 's' : ''}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={draftDays}
            onChange={(event) => setDraftDays(Number(event.target.value))}
            className="w-full accent-[var(--accent)]"
            aria-label="Nombre de jours de prévision"
          />
          <div className="data flex justify-between text-[10px] text-faint">
            <span>1 j</span>
            <span>16 j</span>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-1.5">Unités</p>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[11px] text-muted">
              Température
              <select
                value={draftUnits.temperature}
                onChange={(event) =>
                  setDraftUnits({
                    ...draftUnits,
                    temperature: event.target
                      .value as UnitSettings['temperature'],
                  })
                }
                className="field mt-1 py-1.5 text-xs"
              >
                <option value="celsius">°C</option>
                <option value="fahrenheit">°F</option>
              </select>
            </label>

            <label className="text-[11px] text-muted">
              Vent
              <select
                value={draftUnits.wind}
                onChange={(event) =>
                  setDraftUnits({
                    ...draftUnits,
                    wind: event.target.value as UnitSettings['wind'],
                  })
                }
                className="field mt-1 py-1.5 text-xs"
              >
                <option value="kmh">km/h</option>
                <option value="ms">m/s</option>
                <option value="mph">mph</option>
                <option value="kn">kn</option>
              </select>
            </label>

            <label className="text-[11px] text-muted">
              Précipitations
              <select
                value={draftUnits.precipitation}
                onChange={(event) =>
                  setDraftUnits({
                    ...draftUnits,
                    precipitation: event.target
                      .value as UnitSettings['precipitation'],
                  })
                }
                className="field mt-1 py-1.5 text-xs"
              >
                <option value="mm">mm</option>
                <option value="inch">inch</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
