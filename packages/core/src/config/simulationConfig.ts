import { getMaterialPreset, type MaterialId } from '../materials'

export interface MaterialCustomConfig {
  name: string
  /** Total Solids fraction (0-1). Example: 0.2 = 20% */
  totalSolidsFraction: number
  /** VS/TS fraction (0-1) */
  volatileSolidsFraction: number
  /** Potential biogas production (m³/kg SV) */
  potentialBiogas: number
}

export type MaterialSelectionConfig =
  | { mode: 'preset'; presetId: MaterialId }
  | { mode: 'custom'; custom: MaterialCustomConfig }

export interface BasicSimulationConfig {
  /** Material de llenado seleccionado */
  material: MaterialSelectionConfig
  /** Masa de llenado (kg) */
  fillingMass: number
}

export interface EnvironmentalSimulationConfig {
  /** Temperatura (°C) */
  temperature: number
  /** pH (0-14) */
  ph?: number
}

export interface SubstrateSimulationConfig {
  /** Relación C/N */
  cn_ratio?: number
  /** Material molido o triturado */
  milled?: boolean
}

export interface PhysicalSimulationConfig {
  /** Densidad aproximada (kg/m³). En UI se muestra como kg/L (convertible). */
  approxDensity: number
  /** Agua agregada (kg) */
  addedWater: number
  /**
   * Humedad del llenado (%). Si es 0/undefined/null, se estima usando TS del material.
   * Si viene (por sensor/import), se usa para calcular TS: TS = mass * (1 - moisture/100)
   */
  moistureFilling?: number | null
}

export interface BiologicalSimulationConfig {
  /** Tiempo de retardo (días) */
  lagTime: number
}

export interface SimulationConfig {
  basic: BasicSimulationConfig
  environmental: EnvironmentalSimulationConfig
  physical: PhysicalSimulationConfig
  biological: BiologicalSimulationConfig
  substrate?: SubstrateSimulationConfig
}

/**
 * Legacy flat inputs (pre-multi-view) para compatibilidad.
 * Nota: se mantiene para no romper la app mientras migramos la UI.
 */
export interface LegacySimulationInputs {
  name: string
  approxDensity: number
  temperature: number
  lagTime: number
  fillingMass: number
  moistureFilling?: number | null
  addedWater: number
  totalSolidsPercent: number
  volatileSolidsPercent: number
  potentialBiogas: number
}

export function createDefaultSimulationConfig(): SimulationConfig {
  return {
    basic: {
      material: { mode: 'preset', presetId: 'bovino' },
      fillingMass: 100
    },
    environmental: {
      temperature: 30
    },
    physical: {
      approxDensity: 1000,
      moistureFilling: null,
      addedWater: 0
    },
    biological: {
      lagTime: 1,
      
    }
  }
}

function normalizePercentToFraction(v: number): number {
  // If user passes 20 (meaning 20%), convert to 0.2. If passes 0.2, keep.
  return v > 1 ? v / 100 : v
}

export function configFromLegacyInputs(inputs: LegacySimulationInputs): SimulationConfig {
  const tsFraction = normalizePercentToFraction(Number(inputs.totalSolidsPercent))
  const vsFraction = normalizePercentToFraction(Number(inputs.volatileSolidsPercent))
  const moistureFilling =
    inputs.moistureFilling === null || inputs.moistureFilling === undefined
      ? null
      : Number(inputs.moistureFilling)

  return {
    basic: {
      // Legacy name used to be free text. Now it's material selector.
      // If legacy includes explicit TS/VS/potential, map to custom material.
      material: {
        mode: 'custom',
        custom: {
          name: inputs.name || 'Material personalizado',
          totalSolidsFraction: tsFraction,
          volatileSolidsFraction: vsFraction,
          potentialBiogas: Number(inputs.potentialBiogas)
        }
      },
      fillingMass: inputs.fillingMass
    },
    environmental: {
      temperature: inputs.temperature
    },
    physical: {
      approxDensity: inputs.approxDensity,
      moistureFilling,
      addedWater: inputs.addedWater
    },
    biological: {
      lagTime: inputs.lagTime
    }
  }
}

export function legacyInputsFromConfig(config: SimulationConfig): LegacySimulationInputs {
  const material = config.basic.material
  const resolvedMaterial =
    material.mode === 'preset' ? getMaterialPreset(material.presetId) : material.custom
  const name = resolvedMaterial.name
  const tsFraction = resolvedMaterial.totalSolidsFraction
  const vsFraction = resolvedMaterial.volatileSolidsFraction
  const potential = resolvedMaterial.potentialBiogas

  return {
    // For legacy exports we keep name as string
    name,
    approxDensity: config.physical.approxDensity,
    temperature: config.environmental.temperature,
    lagTime: config.biological.lagTime,
    fillingMass: config.basic.fillingMass,
    moistureFilling: Number(config.physical.moistureFilling ?? 0),
    addedWater: config.physical.addedWater,
    totalSolidsPercent: tsFraction * 100,
    volatileSolidsPercent: vsFraction,
    potentialBiogas: potential
  }
}

/**
 * Completa inputs opcionales para Advisor sin alterar la simulación.
 * Defaults (solo si faltan/no son finitos): temp=35, ph=7.2, cn_ratio=25, milled=false.
 */
export function normalizeCoreInputFactsV1(config: SimulationConfig): SimulationConfig {
  const environmental: EnvironmentalSimulationConfig = {
    ...config.environmental
  }
  const substrate: SubstrateSimulationConfig = {
    ...(config.substrate ?? {})
  }

  if (!Number.isFinite(environmental.temperature)) {
    environmental.temperature = 35
  }

  if (!Number.isFinite(environmental.ph)) {
    environmental.ph = 7.2
  }

  if (!Number.isFinite(substrate.cn_ratio)) {
    substrate.cn_ratio = 25
  }

  if (typeof substrate.milled !== 'boolean') {
    substrate.milled = false
  }

  return {
    ...config,
    environmental,
    substrate
  }
}

export function isSimulationConfig(value: unknown): value is SimulationConfig {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.basic === 'object' &&
    typeof v.environmental === 'object' &&
    typeof v.physical === 'object' &&
    typeof v.biological === 'object'
  )
}
