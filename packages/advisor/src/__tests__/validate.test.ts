import { describe, expect, it } from 'vitest'
import type { RuleV1 } from '../rules/schema.v1'
import { assertValidRuleV1 } from '../rules/validate.v1'

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
