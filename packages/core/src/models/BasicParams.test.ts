import { describe, it, expect } from 'vitest'
import { BasicParams } from './BasicParams'

describe('BasicParams', () => {
  it('creates instance with correct values', () => {
    const params = new BasicParams('Maize', 20, 0.79, 0.5)
    
    expect(params.name).toBe('Maize')
    expect(params.totalSolids).toBe(20)
    expect(params.volatileSolids).toBe(0.79)
    expect(params.potentialBiogasProduction).toBe(0.5)
  })
})