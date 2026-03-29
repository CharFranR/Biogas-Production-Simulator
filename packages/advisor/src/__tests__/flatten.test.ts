import { describe, expect, it } from 'vitest'
import { deepFlattenFacts } from '../facts/flatten'

describe('deepFlattenFacts', () => {
  it('flattens nested objects with dot paths', () => {
    const facts = deepFlattenFacts({ environmental: { temperature: 35 } }, 'inputs')

    expect(facts['inputs.environmental.temperature']).toBe(35)
  })

  it('flattens small arrays by index', () => {
    const facts = deepFlattenFacts({ feed: [1, 2] }, 'inputs')

    expect(facts['inputs.feed.0']).toBe(1)
    expect(facts['inputs.feed.1']).toBe(2)
  })

  it('truncates large arrays and emits length metadata', () => {
    const facts = deepFlattenFacts(
      { feed: [1, 2, 3] },
      'inputs',
      { maxArrayElements: 2 }
    )

    expect(facts['inputs.feed']).toBeNull()
    expect(facts['inputs.feed.length']).toBe(3)
    expect(facts['inputs.feed.0']).toBeUndefined()
  })

  it('respects depth and key limits', () => {
    const facts = deepFlattenFacts(
      { a: { b: { c: 1 } }, d: 2 },
      'inputs',
      { maxDepth: 2, maxKeys: 2 }
    )

    expect(facts['inputs.a.b']).toBeNull()
    expect(Object.keys(facts).length).toBeLessThanOrEqual(2)
  })
})
