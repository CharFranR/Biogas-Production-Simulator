import type { FactValue, Facts } from '../facts/types'
import type { AdvisorMatch } from '../types'
import type { RuleOperatorV1, RuleV1 } from './schema.v1'

function isNumber(value: FactValue): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function compareNumbers(op: RuleOperatorV1, left: number, right: number): boolean {
  switch (op) {
    case 'gt':
      return left > right
    case 'gte':
      return left >= right
    case 'lt':
      return left < right
    case 'lte':
      return left <= right
    case 'eq':
      return left === right
    case 'neq':
      return left !== right
  }
}

function compareValues(op: RuleOperatorV1, left: FactValue, right: FactValue): boolean {
  if (op === 'eq') return left === right
  if (op === 'neq') return left !== right

  if (!isNumber(left) || !isNumber(right)) {
    return false
  }

  return compareNumbers(op, left, right)
}

export function evaluateRulesV1(rules: RuleV1[], facts: Facts): AdvisorMatch[] {
  return rules.flatMap(rule => {
    if (rule.status === 'requires_new_fact') return []
    if (rule.requiresFacts?.length) {
      const hasAllFacts = rule.requiresFacts.every(factId => facts[factId] !== undefined)
      if (!hasAllFacts) return []
    }
    const factValue = facts[rule.when.fact]
    if (factValue === undefined) return []

    const matches = compareValues(rule.when.op, factValue, rule.when.value)
    if (!matches) return []

    return [
      {
        ruleId: rule.id,
        title: rule.title,
        action: rule.then,
        evidence: rule.evidence
      }
    ]
  })
}
