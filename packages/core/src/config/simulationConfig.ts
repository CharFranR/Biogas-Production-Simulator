export interface BasicSimulationConfig {
  /** Nombre del material/sustrato */
  name: string
  /** Masa de llenado (kg) */
  fillingMass: number
}

export interface EnvironmentalSimulationConfig {
  /** Temperatura (°C) */
  temperature: number
}

export interface PhysicalSimulationConfig {
  /** Densidad aproximada (kg/m³). En UI se muestra como kg/L (convertible). */
  approxDensity: number
  /** Agua agregada (kg) */
  addedWater: number
  /** Humedad del llenado (%) */
  moistureFilling: number
}

export interface BiologicalSimulationConfig {
  /** Tiempo de retardo (días) */
  lagTime: number
  /** Sólidos totales (%) */
  totalSolidsPercent: number
  /** Sólidos volátiles (%) o fracción VS/TS según convención actual */
  volatileSolidsPercent: number
  /** Producción potencial de biogás (m³/kg SV) */
  potentialBiogas: number
}

export interface SimulationConfig {
  basic: BasicSimulationConfig
  environmental: EnvironmentalSimulationConfig
  physical: PhysicalSimulationConfig
  biological: BiologicalSimulationConfig
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
  moistureFilling: number
  addedWater: number
  totalSolidsPercent: number
  volatileSolidsPercent: number
  potentialBiogas: number
}

export function createDefaultSimulationConfig(): SimulationConfig {
  return {
    basic: {
      name: 'Material',
      fillingMass: 100
    },
    environmental: {
      temperature: 30
    },
    physical: {
      approxDensity: 1000,
      moistureFilling: 50,
      addedWater: 0
    },
    biological: {
      lagTime: 1,
      totalSolidsPercent: 20,
      volatileSolidsPercent: 0.79,
      potentialBiogas: 0.5
    }
  }
}

export function configFromLegacyInputs(inputs: LegacySimulationInputs): SimulationConfig {
  return {
    basic: {
      name: inputs.name,
      fillingMass: inputs.fillingMass
    },
    environmental: {
      temperature: inputs.temperature
    },
    physical: {
      approxDensity: inputs.approxDensity,
      moistureFilling: inputs.moistureFilling,
      addedWater: inputs.addedWater
    },
    biological: {
      lagTime: inputs.lagTime,
      totalSolidsPercent: inputs.totalSolidsPercent,
      volatileSolidsPercent: inputs.volatileSolidsPercent,
      potentialBiogas: inputs.potentialBiogas
    }
  }
}

export function legacyInputsFromConfig(config: SimulationConfig): LegacySimulationInputs {
  return {
    name: config.basic.name,
    approxDensity: config.physical.approxDensity,
    temperature: config.environmental.temperature,
    lagTime: config.biological.lagTime,
    fillingMass: config.basic.fillingMass,
    moistureFilling: config.physical.moistureFilling,
    addedWater: config.physical.addedWater,
    totalSolidsPercent: config.biological.totalSolidsPercent,
    volatileSolidsPercent: config.biological.volatileSolidsPercent,
    potentialBiogas: config.biological.potentialBiogas
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
