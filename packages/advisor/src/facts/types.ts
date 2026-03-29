export type FactValue = number | boolean | string | null

export type FactId =
  | `inputs.${string}`
  | `outputs.${string}`
  | `series.${string}`
  | `derived.${string}`

export type Facts = Record<FactId, FactValue>

export interface AdvisorParams {
  N: number
  plateauPct: number
  reachPct: number
}

export const ADVISOR_DEFAULTS: AdvisorParams = {
  N: 7,
  plateauPct: 5,
  reachPct: 80
}
