import { describe, expect, it } from 'vitest'
import { evaluateRulesV1 } from '../rules/evaluator.v1'
import type { RuleV1 } from '../rules/schema.v1'
import type { Facts } from '../facts/types'

const baseRule: RuleV1 = {
  id: 'rule-op',
  title: 'Regla operador',
  when: {
    fact: 'derived.finalAccumulated_m3',
    op: 'gt',
    value: 10
  },
  then: {
    kind: 'recommendation',
    message: 'Mensaje',
    severity: 'info'
  },
  evidence: {
    pdf: 'Biodigestores.pdf',
    page: 12,
    quote: 'Evidencia'
  }
}

describe('evaluateRulesV1', () => {
  it('matches numeric operators correctly', () => {
    const facts: Facts = {
      'derived.finalAccumulated_m3': 10,
      'derived.dailyPeak_m3': 5
    }

    const rules: RuleV1[] = [
      { ...baseRule, id: 'gt', when: { ...baseRule.when, op: 'gt', value: 9 } },
      { ...baseRule, id: 'gte', when: { ...baseRule.when, op: 'gte', value: 10 } },
      { ...baseRule, id: 'lt', when: { ...baseRule.when, op: 'lt', value: 11 } },
      { ...baseRule, id: 'lte', when: { ...baseRule.when, op: 'lte', value: 10 } },
      { ...baseRule, id: 'eq', when: { ...baseRule.when, op: 'eq', value: 10 } },
      { ...baseRule, id: 'neq', when: { ...baseRule.when, op: 'neq', value: 8 } }
    ]

    const matches = evaluateRulesV1(rules, facts)

    expect(matches).toHaveLength(6)
    expect(matches.map(match => match.ruleId)).toEqual([
      'gt',
      'gte',
      'lt',
      'lte',
      'eq',
      'neq'
    ])
  })

  it('skips rules when fact is missing', () => {
    const facts: Facts = {
      'derived.dailyPeak_m3': 5
    }

    const matches = evaluateRulesV1([baseRule], facts)

    expect(matches).toHaveLength(0)
  })

  it('skips rules that require new facts', () => {
    const facts: Facts = {
      'derived.finalAccumulated_m3': 20
    }

    const rule: RuleV1 = {
      ...baseRule,
      status: 'requires_new_fact'
    }

    const matches = evaluateRulesV1([rule], facts)

    expect(matches).toHaveLength(0)
  })

  it('preserves evidence in the match output', () => {
    const facts: Facts = {
      'derived.finalAccumulated_m3': 20
    }

    const matches = evaluateRulesV1([baseRule], facts)

    expect(matches).toHaveLength(1)
    expect(matches[0].evidence).toEqual(baseRule.evidence)
  })
})
