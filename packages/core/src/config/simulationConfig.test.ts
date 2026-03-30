import { describe, it, expect } from 'vitest'
import {
  createDefaultSimulationConfig,
  configFromLegacyInputs,
  legacyInputsFromConfig,
  isSimulationConfig,
  normalizeCoreInputFactsV1,
  type LegacySimulationInputs,
  type SimulationConfig
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

  it('fills defaults when core input facts are missing', () => {
    const base = createDefaultSimulationConfig()
    const cfg: SimulationConfig = {
      ...base,
      environmental: {
        ...base.environmental,
        temperature: Number.NaN
      },
      substrate: undefined
    }

    const normalized = normalizeCoreInputFactsV1(cfg)

    expect(normalized.environmental.temperature).toBe(35)
    expect(normalized.environmental.ph).toBe(7.2)
    expect(normalized.substrate?.cn_ratio).toBe(25)
    expect(normalized.substrate?.milled).toBe(false)
  })

  it('preserves overrides for environmental and substrate inputs', () => {
    const base = createDefaultSimulationConfig()
    const cfg: SimulationConfig = {
      ...base,
      environmental: {
        ...base.environmental,
        temperature: 42,
        ph: 6.8
      },
      substrate: {
        cn_ratio: 30,
        milled: true
      }
    }

    const normalized = normalizeCoreInputFactsV1(cfg)

    expect(normalized.environmental.temperature).toBe(42)
    expect(normalized.environmental.ph).toBe(6.8)
    expect(normalized.substrate?.cn_ratio).toBe(30)
    expect(normalized.substrate?.milled).toBe(true)
  })

  it('does not overwrite an existing temperature', () => {
    const base = createDefaultSimulationConfig()
    const cfg: SimulationConfig = {
      ...base,
      environmental: {
        ...base.environmental,
        temperature: 18
      }
    }

    const normalized = normalizeCoreInputFactsV1(cfg)

    expect(normalized.environmental.temperature).toBe(18)
  })

  it('supports old configs missing substrate or environmental.ph', () => {
    const base = createDefaultSimulationConfig()
    const cfg = {
      ...base,
      environmental: {
        temperature: 22
      }
    } as SimulationConfig

    const normalized = normalizeCoreInputFactsV1(cfg)

    expect(normalized.environmental.temperature).toBe(22)
    expect(normalized.environmental.ph).toBe(7.2)
    expect(normalized.substrate?.cn_ratio).toBe(25)
    expect(normalized.substrate?.milled).toBe(false)
  })
})
