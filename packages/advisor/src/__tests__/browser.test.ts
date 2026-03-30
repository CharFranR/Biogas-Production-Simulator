import { describe, expect, it } from 'vitest'
import { evaluateAdvisor } from '../index'
import type { SimulationData } from '../simulation'

describe('evaluateAdvisor (browser-safe)', () => {
  it('runs without Node-only globals', () => {
    const originalWindow = (globalThis as { window?: unknown }).window
    ;(globalThis as { window?: unknown }).window = undefined

    const simulationData: SimulationData = {
      outputs: {
        potentialProduction: 100
      },
      timeSeries: {
        time: [1, 2, 3, 4, 5],
        accumulated: [0, 20, 40, 60, 80],
        daily: [0, 20, 20, 20, 20]
      }
    }

    expect(() => evaluateAdvisor(simulationData)).not.toThrow()

    if (originalWindow !== undefined) {
      ;(globalThis as { window?: unknown }).window = originalWindow
    }
  })
})
