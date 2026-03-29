export type MaterialId = 'bovino'

export interface MaterialPreset {
  id: MaterialId
  name: string
  /** Total Solids fraction (0-1). Example: 0.2 = 20% TS */
  totalSolidsFraction: number
  /** Volatile Solids fraction relative to TS (VS/TS) (0-1). Example: 0.79 */
  volatileSolidsFraction: number
  /** Potential biogas production (m³/kg SV) */
  potentialBiogas: number
}

export const MATERIAL_PRESETS: readonly MaterialPreset[] = [
  {
    id: 'bovino',
    name: 'Bovino',
    totalSolidsFraction: 0.2,
    volatileSolidsFraction: 0.79,
    potentialBiogas: 0.0158
  }
] as const

export function getMaterialPreset(id: MaterialId): MaterialPreset {
  const found = MATERIAL_PRESETS.find(m => m.id === id)
  if (!found) {
    // exhaustive guard (in case MaterialId grows and preset list lags)
    throw new Error(`Material preset not found: ${String(id)}`)
  }
  return found
}
