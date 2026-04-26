import { describe, expect, it } from 'vitest'
import { sideLabel } from './sideLabel'

describe('sideLabel', () => {
  it('returns display labels for each side', () => {
    expect(sideLabel('buy')).toBe('Buy')
    expect(sideLabel('sell')).toBe('Sell')
  })
})
