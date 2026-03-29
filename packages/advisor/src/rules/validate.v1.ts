import type { FactValue } from '../facts/types'
import type { RuleOperatorV1, RuleV1 } from './schema.v1'

const ALLOWED_OPERATORS: RuleOperatorV1[] = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq']

function isFactValue(value: unknown): value is FactValue {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null
  )
}

export function assertValidRuleV1(rule: RuleV1): void {
  if (!rule.id || rule.id.trim().length === 0) {
    throw new Error('RuleV1: id is required')
  }
  if (!rule.title || rule.title.trim().length === 0) {
    throw new Error('RuleV1: title is required')
  }
  if (!rule.when) {
    throw new Error(`RuleV1(${rule.id}): when is required`)
  }
  if (!rule.when.fact) {
    throw new Error(`RuleV1(${rule.id}): when.fact is required`)
  }
  if (!rule.when.op || !ALLOWED_OPERATORS.includes(rule.when.op)) {
    throw new Error(`RuleV1(${rule.id}): when.op is invalid`) 
  }
  if (!isFactValue(rule.when.value)) {
    throw new Error(`RuleV1(${rule.id}): when.value must be a FactValue`)
  }
  if (!rule.then) {
    throw new Error(`RuleV1(${rule.id}): then is required`)
  }
  if (rule.then.kind !== 'recommendation') {
    throw new Error(`RuleV1(${rule.id}): then.kind must be 'recommendation'`)
  }
  if (!rule.then.message || rule.then.message.trim().length === 0) {
    throw new Error(`RuleV1(${rule.id}): then.message is required`)
  }
  if (!rule.evidence) {
    throw new Error(`RuleV1(${rule.id}): evidence is required`)
  }
  if (!rule.evidence.pdf || rule.evidence.pdf.trim().length === 0) {
    throw new Error(`RuleV1(${rule.id}): evidence.pdf is required`)
  }
  if (rule.evidence.pdf.includes('/') || rule.evidence.pdf.includes('..')) {
    throw new Error(`RuleV1(${rule.id}): evidence.pdf must be a basename without paths`)
  }
  if (typeof rule.evidence.page !== 'number' || Number.isNaN(rule.evidence.page)) {
    throw new Error(`RuleV1(${rule.id}): evidence.page must be a number`)
  }
  if (rule.evidence.page <= 0) {
    throw new Error(`RuleV1(${rule.id}): evidence.page must be > 0`)
  }
  if (!rule.evidence.quote || rule.evidence.quote.trim().length === 0) {
    throw new Error(`RuleV1(${rule.id}): evidence.quote is required`)
  }
}

export function assertValidRulesV1(rules: RuleV1[]): void {
  rules.forEach(assertValidRuleV1)
}
