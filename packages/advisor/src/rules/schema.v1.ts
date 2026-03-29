import type { FactId, FactValue } from '../facts/types'

export type RuleOperatorV1 = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq'

export interface ConditionV1 {
  fact: FactId
  op: RuleOperatorV1
  value: FactValue
}

export interface ActionV1 {
  kind: 'recommendation'
  message: string
  severity?: 'info' | 'warn' | 'critical'
}

export interface EvidenceCitation {
  /**
   * Basename only (no paths). Must match a file in docs/investigation/.
   * Example: "Coronado2010.pdf"
   */
  pdf: string
  page: number
  quote: string
}

export interface RuleV1 {
  id: string
  title: string
  when: ConditionV1
  then: ActionV1
  status?: 'active' | 'requires_new_fact'
  requiresFacts?: FactId[]
  evidence: EvidenceCitation
}
