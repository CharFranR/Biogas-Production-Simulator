import type { SimulationData } from '../simulation'
import type { AdvisorParams, FactValue } from './types'

export const DERIVED_FACT_IDS = [
  'derived.dailyPeak_m3',
  'derived.dayOfDailyPeak_day',
  'derived.dailyMeanFirstNDays_m3',
  'derived.dailyMeanLastNDays_m3',
  'derived.dailyDropPct_lastN_vs_firstN_pct',
  'derived.plateauDays_thresholdPct_days',
  'derived.timeToReachPctOfPotential_days',
  'derived.finalAccumulated_m3',
  'derived.finalVsPotential_ratio',
  'derived.isMonotonicAccumulated_bool',
  'derived.ts_pct',
  'derived.vs_pct',
  'derived.vs_of_ts_pct'
] as const

export type DerivedFactId = typeof DERIVED_FACT_IDS[number]
export type DerivedFacts = Record<DerivedFactId, FactValue>

const DEFAULT_PARAMS: AdvisorParams = {
  N: 7,
  plateauPct: 5,
  reachPct: 80
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

function lastFinite(values: number[]): number | null {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const value = values[i]
    if (Number.isFinite(value)) return value
  }
  return null
}

function maxFinite(values: number[]): number | null {
  const finiteValues = values.filter(isFiniteNumber)
  if (finiteValues.length === 0) return null
  return Math.max(...finiteValues)
}

function resolveTotalAccum(accumulated: number[]): number {
  const lastValue = lastFinite(accumulated)
  if (lastValue !== null) return lastValue
  const maxValue = maxFinite(accumulated)
  return maxValue ?? 0
}

function resolveTimeValue(time: number[], index: number): number {
  const candidate = time[index]
  if (Number.isFinite(candidate)) return candidate
  return index + 1
}

function dailyPeak(daily: number[]): { peak: number; index: number | null } {
  let peak = -Infinity
  let index: number | null = null
  for (let i = 0; i < daily.length; i += 1) {
    const value = daily[i]
    if (!isFiniteNumber(value)) continue
    if (value > peak) {
      peak = value
      index = i
    }
  }

  if (!Number.isFinite(peak)) return { peak: 0, index: null }
  return { peak, index }
}

function findReachPctDay(
  accumulated: number[],
  time: number[],
  target: number
): number | null {
  if (!Number.isFinite(target) || target <= 0) return null
  for (let i = 0; i < accumulated.length; i += 1) {
    const value = accumulated[i]
    if (!Number.isFinite(value)) continue
    if (value >= target) return resolveTimeValue(time, i)
  }
  return null
}

function computePlateauDays(
  daily: number[],
  N: number,
  peak: number,
  thresholdPct: number
): number {
  if (N <= 0 || daily.length < N) return 0
  if (!Number.isFinite(peak) || peak <= 0) return 0
  // Plateau definition (v1): in the LAST N days, count days where daily production
  // is BELOW a relative threshold of the peak (e.g., 5% of peak).
  const threshold = peak * (thresholdPct / 100)
  const windowStart = Math.max(daily.length - N, 0)
  const window = daily.slice(windowStart)

  if (window.length === 0) return 0
  return window.reduce((count, value) => {
    if (!isFiniteNumber(value)) return count
    return value <= threshold ? count + 1 : count
  }, 0)
}

function isMonotonicNonDecreasing(values: number[]): boolean {
  let last: number | null = null
  for (const value of values) {
    if (!isFiniteNumber(value)) continue
    if (last !== null && value < last) return false
    last = value
  }
  return true
}

export function computeDerivedFacts(
  simData: SimulationData,
  params?: Partial<AdvisorParams>
): DerivedFacts {
  const inputs = simData.inputs as
    | {
        basic?: { fillingMass?: number | null }
        physical?: { addedWater?: number | null }
      }
    | undefined
  const resolvedParams = { ...DEFAULT_PARAMS, ...params }
  const daily = Array.isArray(simData.timeSeries?.daily) ? simData.timeSeries.daily : []
  const accumulated = Array.isArray(simData.timeSeries?.accumulated)
    ? simData.timeSeries.accumulated
    : []
  const time = Array.isArray(simData.timeSeries?.time) ? simData.timeSeries.time : []

  const finalAccumulated = resolveTotalAccum(accumulated)
  const { peak: dailyPeakValue, index: dailyPeakIndex } = dailyPeak(daily)
  const dayOfDailyPeak = dailyPeakIndex === null ? null : resolveTimeValue(time, dailyPeakIndex)

  const dailyMeanFirstN = mean(daily.slice(0, resolvedParams.N).filter(isFiniteNumber))
  const dailyMeanLastN = mean(
    daily.slice(Math.max(daily.length - resolvedParams.N, 0)).filter(isFiniteNumber)
  )
  const dailyDropPct =
    dailyMeanFirstN > 0
      ? ((dailyMeanFirstN - dailyMeanLastN) / dailyMeanFirstN) * 100
      : 0

  const plateauDays = computePlateauDays(
    daily,
    resolvedParams.N,
    dailyPeakValue,
    resolvedParams.plateauPct
  )

  const potentialProduction = simData.outputs?.potentialProduction
  const numericPotential = Number.isFinite(potentialProduction) ? (potentialProduction as number) : 0
  const validPotential = numericPotential > 0
  const baseForReach = validPotential ? numericPotential : finalAccumulated
  const reachTarget = baseForReach > 0 ? (baseForReach * resolvedParams.reachPct) / 100 : 0
  const timeToReachPct = findReachPctDay(accumulated, time, reachTarget)

  const finalVsPotentialRatio = validPotential ? finalAccumulated / numericPotential : 0

  const monotonicAccumulated = isMonotonicNonDecreasing(accumulated)

  const fillingMass = isFiniteNumber(inputs?.basic?.fillingMass)
    ? Number(inputs?.basic?.fillingMass)
    : 0
  const addedWaterRaw = inputs?.physical?.addedWater
  const addedWater = isFiniteNumber(addedWaterRaw) ? Number(addedWaterRaw) : 0
  const mixMass = fillingMass + addedWater

  const totalSolids = isFiniteNumber(simData.outputs?.TotalSolids)
    ? Number(simData.outputs?.TotalSolids)
    : null
  const volatileSolids = isFiniteNumber(simData.outputs?.VolatileSolids)
    ? Number(simData.outputs?.VolatileSolids)
    : null
  const tsPct =
    mixMass > 0 && totalSolids !== null ? clampPercent((totalSolids / mixMass) * 100) : null
  const vsPct = mixMass > 0 && volatileSolids !== null
    ? clampPercent((volatileSolids / mixMass) * 100)
    : null
  const vsOfTsPct = totalSolids !== null && totalSolids > 0 && volatileSolids !== null
    ? clampPercent((volatileSolids / totalSolids) * 100)
    : null

  const facts: DerivedFacts = {
    'derived.dailyPeak_m3': Number.isFinite(dailyPeakValue) ? dailyPeakValue : 0,
    'derived.dayOfDailyPeak_day': dayOfDailyPeak,
    'derived.dailyMeanFirstNDays_m3': Number.isFinite(dailyMeanFirstN) ? dailyMeanFirstN : 0,
    'derived.dailyMeanLastNDays_m3': Number.isFinite(dailyMeanLastN) ? dailyMeanLastN : 0,
    'derived.dailyDropPct_lastN_vs_firstN_pct': Number.isFinite(dailyDropPct) ? dailyDropPct : 0,
    'derived.plateauDays_thresholdPct_days': plateauDays,
    'derived.timeToReachPctOfPotential_days': timeToReachPct,
    'derived.finalAccumulated_m3': Number.isFinite(finalAccumulated) ? finalAccumulated : 0,
    'derived.finalVsPotential_ratio': Number.isFinite(finalVsPotentialRatio)
      ? finalVsPotentialRatio
      : 0,
    'derived.isMonotonicAccumulated_bool': monotonicAccumulated,
    // Wet basis percentages: % of total wet mix mass (fillingMass + addedWater).
    'derived.ts_pct': tsPct,
    'derived.vs_pct': vsPct,
    'derived.vs_of_ts_pct': vsOfTsPct
  }

  if (Object.keys(facts).length !== DERIVED_FACT_IDS.length) {
    throw new Error(`Derived facts mismatch: expected ${DERIVED_FACT_IDS.length} keys`)
  }

  return facts
}
