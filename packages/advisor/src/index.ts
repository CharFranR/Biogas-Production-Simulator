import { computeDerivedFacts, DERIVED_FACT_IDS } from './facts/derived'
import { ADVISOR_DEFAULTS, type AdvisorParams, type FactValue, type Facts } from './facts/types'
import { RULES_V1 } from './rules/rules.v1'
import { evaluateRulesV1 } from './rules/evaluator.v1'
import { assertValidRulesV1 } from './rules/validate.v1'
import type { SimulationData } from './simulation'
import type { AdvisorMatch } from './types'

export type { AdvisorParams, FactId, FactValue, Facts } from './facts/types'
export type { SimulationData } from './simulation'
export type { AdvisorMatch } from './types'
export { ADVISOR_DEFAULTS, DERIVED_FACT_IDS }

function normalizeInputs(inputs: SimulationData['inputs']): Record<string, FactValue> {
  if (!inputs || typeof inputs !== 'object') return {}
  return Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [`inputs.${key}`, value as FactValue])
  )
}

function normalizeOutputs(outputs: SimulationData['outputs']): Record<string, FactValue> {
  if (!outputs || typeof outputs !== 'object') return {}
  return Object.fromEntries(
    Object.entries(outputs).map(([key, value]) => [`outputs.${key}`, value as FactValue])
  )
}

function normalizeSeries(series: SimulationData['timeSeries']): Record<string, FactValue> {
  if (!series || typeof series !== 'object') return {}
  return Object.fromEntries(
    Object.entries(series).map(([key, value]) => [`series.${key}`, value as FactValue])
  )
}

function buildFacts(simData: SimulationData, params?: Partial<AdvisorParams>): Facts {
  const derivedFacts = computeDerivedFacts(simData, params)
  return {
    ...(normalizeInputs(simData.inputs) as Facts),
    ...(normalizeOutputs(simData.outputs) as Facts),
    ...(normalizeSeries(simData.timeSeries) as Facts),
    ...(derivedFacts as Facts)
  }
}

let rulesValidated = false

export function evaluateAdvisor(
  simData: SimulationData,
  params?: Partial<AdvisorParams>
): AdvisorMatch[] {
  if (!rulesValidated) {
    assertValidRulesV1(RULES_V1)
    rulesValidated = true
  }

  const facts = buildFacts(simData, params)
  return evaluateRulesV1(RULES_V1, facts)
}
