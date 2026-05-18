import { describe, expect, it } from 'vitest'

import { assignCompactLayers } from './compactFlowLayout'

describe('assignCompactLayers', () => {
  it('places root at layer 0 and downstream positive', () => {
    const ids = new Set(['r', 'a', 'b'])
    const children = new Map([
      ['r', ['a']],
      ['a', ['b']],
      ['b', []],
    ])
    const parents = new Map([
      ['r', []],
      ['a', ['r']],
      ['b', ['a']],
    ])
    const layers = assignCompactLayers('r', ids, children, parents)
    expect(layers.get('r')).toBe(0)
    expect(layers.get('a')).toBe(1)
    expect(layers.get('b')).toBe(2)
  })

  it('upstream is negative layer', () => {
    const ids = new Set(['r', 'p'])
    const children = new Map([
      ['p', ['r']],
      ['r', []],
    ])
    const parents = new Map([
      ['p', []],
      ['r', ['p']],
    ])
    const layers = assignCompactLayers('r', ids, children, parents)
    expect(layers.get('p')).toBe(-1)
    expect(layers.get('r')).toBe(0)
  })
})
