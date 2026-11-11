import { useEffect, useState } from 'react'
import { fetchModelRunInfo } from '../api/openMeteo'
import { modelMetaIds } from '../data/models'
import type { Location, ModelRunInfo } from '../types'

function runTimestamp(run: ModelRunInfo): number {
  return run.availabilityTime ?? run.initialisationTime
}

function newestRun(runs: (ModelRunInfo | null)[]): ModelRunInfo | null {
  let newest: ModelRunInfo | null = null
  for (const run of runs) {
    if (!run) continue
    if (!newest || runTimestamp(run) > runTimestamp(newest)) newest = run
  }
  return newest
}

export function useModelRuns(
  modelIds: string[],
  location: Location,
  refreshToken: number,
): Record<string, ModelRunInfo> {
  const [runs, setRuns] = useState<Record<string, ModelRunInfo>>({})

  useEffect(() => {
    const targets = modelIds
      .map((modelId) => ({
        modelId,
        metaIds: modelMetaIds(modelId, location),
      }))
      .filter((target) => target.metaIds.length > 0)

    if (targets.length === 0) {
      // oxlint-disable-next-line react/set-state-in-effect
      setRuns({})
      return
    }

    const controller = new AbortController()
    let active = true

    const run = async () => {
      const entries = await Promise.all(
        targets.map(async ({ modelId, metaIds }) => {
          const infos = await Promise.all(
            metaIds.map((metaId) =>
              fetchModelRunInfo(metaId, controller.signal),
            ),
          )
          return [modelId, newestRun(infos)] as const
        }),
      )

      if (!active) return

      const next: Record<string, ModelRunInfo> = {}
      for (const [modelId, info] of entries) {
        if (info) next[modelId] = info
      }
      setRuns(next)
    }

    void run()

    return () => {
      active = false
      controller.abort()
    }
  }, [modelIds, location, refreshToken])

  return runs
}
