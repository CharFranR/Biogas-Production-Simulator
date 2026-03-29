import type { FactValue } from './types'

export interface DeepFlattenOptions {
  maxDepth?: number
  maxKeys?: number
  maxArrayElements?: number
}

const DEFAULT_OPTIONS: Required<DeepFlattenOptions> = {
  maxDepth: 6,
  maxKeys: 2000,
  maxArrayElements: 50
}

function isFactPrimitive(value: unknown): value is FactValue {
  return (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  )
}

export function deepFlattenFacts(
  value: unknown,
  rootPrefix: string,
  options: DeepFlattenOptions = {}
): Record<string, FactValue> {
  if (!rootPrefix) return {}

  const { maxDepth, maxKeys, maxArrayElements } = {
    ...DEFAULT_OPTIONS,
    ...options
  }

  const results: Record<string, FactValue> = {}
  let keyCount = 0
  const seen = new WeakSet<object>()

  const addValue = (path: string, val: FactValue): boolean => {
    if (!path) return false
    const exists = Object.prototype.hasOwnProperty.call(results, path)
    if (!exists && keyCount >= maxKeys) return false
    if (!exists) keyCount += 1
    results[path] = val
    return true
  }

  const addTruncated = (path: string): void => {
    addValue(path, null)
  }

  const traverse = (current: unknown, path: string, depth: number): void => {
    if (!path) return
    if (depth >= maxDepth) {
      addTruncated(path)
      return
    }

    if (isFactPrimitive(current)) {
      addValue(path, current)
      return
    }

    if (Array.isArray(current)) {
      if (current.length === 0) {
        addTruncated(path)
        return
      }
      if (current.length > maxArrayElements) {
        if (!addValue(path, null)) return
        addValue(`${path}.length`, current.length)
        return
      }

      for (let index = 0; index < current.length; index += 1) {
        if (keyCount >= maxKeys) {
          addTruncated(path)
          return
        }
        traverse(current[index], `${path}.${index}`, depth + 1)
      }
      return
    }

    if (typeof current === 'object' && current !== null) {
      if (seen.has(current)) {
        addTruncated(path)
        return
      }
      seen.add(current)
      const entries = Object.entries(current as Record<string, unknown>)
      if (entries.length === 0) {
        addTruncated(path)
        return
      }

      for (const [key, nested] of entries) {
        if (keyCount >= maxKeys) {
          addTruncated(path)
          return
        }
        traverse(nested, `${path}.${key}`, depth + 1)
      }
      return
    }

    addTruncated(path)
  }

  traverse(value, rootPrefix, 0)
  return results
}
