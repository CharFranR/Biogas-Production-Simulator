import { describe, it, expect } from 'vitest'
import {
  createDefaultSimulationConfig,
  configFromLegacyInputs,
  legacyInputsFromConfig,
  isSimulationConfig,
  type LegacySimulationInputs
} from './simulationConfig'

describe('simulationConfig', () => {
  it('creates default config with expected values', () => {
    const cfg = createDefaultSimulationConfig()
    expect(cfg.basic.material.mode).toBe('preset')
    expect(cfg.basic.fillingMass).toBe(100)
    expect(cfg.environmental.temperature).toBe(30)
  })

  it('converts legacy -> config -> legacy without loss', () => {
    const legacy: LegacySimulationInputs = {
      name: 'Maize',
      approxDensity: 1000,
      temperature: 30,
      lagTime: 1,
      fillingMass: 100,
      moistureFilling: 50,
      addedWater: 0,
      totalSolidsPercent: 20,
      volatileSolidsPercent: 0.79,
      potentialBiogas: 0.5
    }

    const cfg = configFromLegacyInputs(legacy)
    expect(isSimulationConfig(cfg)).toBe(true)

    const roundTrip = legacyInputsFromConfig(cfg)
    // legacy TS is stored as percent when round-tripping
    expect(roundTrip.name).toBe(legacy.name)
    expect(roundTrip.totalSolidsPercent).toBe(legacy.totalSolidsPercent)
    expect(roundTrip.volatileSolidsPercent).toBe(legacy.volatileSolidsPercent)
    expect(roundTrip.potentialBiogas).toBe(legacy.potentialBiogas)
  })

  it('fills legacy material fields when preset is selected', () => {
    const cfg = createDefaultSimulationConfig()
    const legacy = legacyInputsFromConfig(cfg)

    expect(legacy.name).toBe('Bovino')
    expect(legacy.totalSolidsPercent).toBe(20)
    expect(legacy.volatileSolidsPercent).toBe(0.79)
    expect(legacy.potentialBiogas).toBe(0.0158)
  })
})
