import { describe, expect, it } from 'vitest'
import { computeDerivedFacts, DERIVED_FACT_IDS } from '../facts/derived'
import type { SimulationData } from '../simulation'

describe('computeDerivedFacts', () => {
  it('returns exactly 10 derived fact keys', () => {
    const simulationData: SimulationData = {
      inputs: {
        temperature: 35
      },
      outputs: {
        potentialProduction: 100
      },
      timeSeries: {
        time: [1, 2, 3, 4, 5],
        accumulated: [0, 10, 25, 40, 60],
        daily: [0, 10, 15, 15, 20]
      }
    }

    const facts = computeDerivedFacts(simulationData)

    expect(Object.keys(facts)).toHaveLength(DERIVED_FACT_IDS.length)
    DERIVED_FACT_IDS.forEach(id => {
      expect(facts).toHaveProperty(id)
    })
  })

  it('uses advisor defaults for N, plateauPct, and reachPct', () => {
    const simulationData: SimulationData = {
      outputs: {
        potentialProduction: 100
      },
      timeSeries: {
        time: [1, 2, 3, 4, 5, 6],
        accumulated: [0, 20, 40, 60, 80, 100],
        daily: [10, 10, 10, 10, 10, 10, 10, 1, 1, 1]
      }
    }

    const facts = computeDerivedFacts(simulationData)
    const overrideFacts = computeDerivedFacts(simulationData, {
      N: 3,
      plateauPct: 20,
      reachPct: 50
    })

    expect(facts['derived.timeToReachPctOfPotential_days']).toBe(5)
    expect(overrideFacts['derived.timeToReachPctOfPotential_days']).toBe(4)

    expect(facts['derived.dailyDropPct_lastN_vs_firstN_pct']).not.toBe(
      overrideFacts['derived.dailyDropPct_lastN_vs_firstN_pct']
    )

    expect(facts['derived.plateauDays_thresholdPct_days']).toBe(0)
    expect(overrideFacts['derived.plateauDays_thresholdPct_days']).toBeGreaterThan(0)
  })

  it('computes correct derived fact values for a deterministic fixture', () => {
    const simulationData: SimulationData = {
      outputs: {
        potentialProduction: 100
      },
      timeSeries: {
        time: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        accumulated: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
        daily: [0, 10, 20, 30, 20, 10, 5, 4, 3, 2]
      }
    }

    const facts = computeDerivedFacts(simulationData)

    expect(facts['derived.dailyPeak_m3']).toBe(30)
    expect(facts['derived.dayOfDailyPeak_day']).toBe(4)
    expect(facts['derived.dailyDropPct_lastN_vs_firstN_pct']).toBeCloseTo(22.1, 1)
    expect(facts['derived.finalVsPotential_ratio']).toBeCloseTo(0.9, 4)
    expect(facts['derived.isMonotonicAccumulated_bool']).toBe(true)
  })
})
