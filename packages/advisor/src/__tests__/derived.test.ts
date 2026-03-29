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
})
