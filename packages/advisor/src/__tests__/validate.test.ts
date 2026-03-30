import { describe, expect, it } from 'vitest'
import { DERIVED_FACT_IDS } from '../facts/derived'
import type { FactId } from '../facts/types'
import { RULES_V1 } from '../rules/rules.v1'
import type { RuleV1 } from '../rules/schema.v1'
import { assertValidRuleV1, assertValidRulesV1 } from '../rules/validate.v1'

const RESOLVABLE_PREFIXES = ['inputs', 'outputs', 'series'] as const

function hasValidDotSegments(factId: string): boolean {
  const segments = factId.split('.')
  return segments.every(segment => {
    if (segment.trim().length === 0) return false
    if (segment.includes('/') || segment.includes('\\')) return false
    return segment === segment.trim()
  })
}

function isResolvableFactId(factId: FactId): boolean {
  if (factId.startsWith('derived.')) {
    return DERIVED_FACT_IDS.includes(factId as (typeof DERIVED_FACT_IDS)[number])
  }

  const prefix = RESOLVABLE_PREFIXES.find(candidate => factId.startsWith(`${candidate}.`))
  if (!prefix) return false

  return hasValidDotSegments(factId)
}

const baseRule: RuleV1 = {
  id: 'rule-1',
  title: 'Regla base',
  when: {
    fact: 'derived.finalAccumulated_m3',
    op: 'gt',
    value: 10
  },
  then: {
    kind: 'recommendation',
    message: 'Mensaje de prueba',
    severity: 'info'
  },
  evidence: {
    pdf: 'Biodigestores.pdf',
    page: 12,
    quote: 'Texto de evidencia.'
  }
}

describe('assertValidRuleV1', () => {
  it('throws when evidence.pdf is missing', () => {
    const rule = {
      ...baseRule,
      evidence: { ...baseRule.evidence, pdf: '' }
    }

    expect(() => assertValidRuleV1(rule)).toThrow('evidence.pdf')
  })

  it('throws when evidence.page is missing', () => {
    const rule = {
      ...baseRule,
      evidence: { ...baseRule.evidence, page: NaN }
    }

    expect(() => assertValidRuleV1(rule)).toThrow('evidence.page')
  })

  it('throws when evidence.quote is missing', () => {
    const rule = {
      ...baseRule,
      evidence: { ...baseRule.evidence, quote: '' }
    }

    expect(() => assertValidRuleV1(rule)).toThrow('evidence.quote')
  })

  it('throws when evidence.pdf contains a path', () => {
    const rule = {
      ...baseRule,
      evidence: { ...baseRule.evidence, pdf: 'docs/investigation/Biodigestores.pdf' }
    }

    expect(() => assertValidRuleV1(rule)).toThrow('evidence.pdf')
  })

  it('throws when status is invalid', () => {
    const rule = {
      ...baseRule,
      status: 'pending'
    } as unknown as RuleV1

    expect(() => assertValidRuleV1(rule)).toThrow('status')
  })

  it('throws when requiresFacts is not an array', () => {
    const rule = {
      ...baseRule,
      requiresFacts: 'inputs.temperature'
    } as unknown as RuleV1

    expect(() => assertValidRuleV1(rule)).toThrow('requiresFacts')
  })
})

describe('RULES_V1 validation', () => {
  it('contains only valid rules', () => {
    expect(() => assertValidRulesV1(RULES_V1)).not.toThrow()
  })

  it('uses resolvable fact IDs for active rules', () => {
    const activeRules = RULES_V1.filter(rule => rule.status === 'active')

    activeRules.forEach(rule => {
      const factIds: FactId[] = [rule.when.fact, ...(rule.requiresFacts ?? [])]
      factIds.forEach(factId => {
        expect(isResolvableFactId(factId)).toBe(true)
      })
    })
  })
})
