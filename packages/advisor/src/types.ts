import type { EvidenceCitation, RuleV1 } from './rules/schema.v1'

export interface AdvisorMatch {
  ruleId: string
  title: string
  action: RuleV1['then']
  evidence: EvidenceCitation
}
