import { useEffect, useState } from 'react'
import { fetchModelRunInfo } from '../api/openMeteo'
import { modelMetaId } from '../data/models'
import type { ModelRunInfo } from '../types'

export function useModelRuns(
  modelIds: string[],
  refreshToken: number,
): Record<string, ModelRunInfo> {
  const [runs, setRuns] = useState<Record<string, ModelRunInfo>>({})

  useEffect(() => {
    const ids = modelIds.flatMap((modelId) => {
      const metaId = modelMetaId(modelId)
      return metaId ? [[modelId, metaId] as const] : []
    })
    if (ids.length === 0) {
      // oxlint-disable-next-line react/set-state-in-effect
      setRuns({})
      return
    }

    const controller = new AbortController()
    let active = true

    const run = async () => {
      const entries = await Promise.all(
        ids.map(async ([modelId, metaId]) => {
          const info = await fetchModelRunInfo(metaId, controller.signal)
          return [modelId, info] as const
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
  }, [modelIds, refreshToken])

  return runs
}
