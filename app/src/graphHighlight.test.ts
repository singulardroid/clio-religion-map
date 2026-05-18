import { describe, expect, it } from 'vitest'

import { buildGraphIndexes, collectGraphHighlight } from './graphHighlight'
import type { ReligionEvent } from './types'

function ev(id: string, targets: string[]): ReligionEvent {
  return {
    concept_id: id,
    territory: 'T',
    locales: { en: { statement: 's', quote: 'q', source_ref: 'r' }, ru: {} },
    connections: targets.map((t) => ({ target_concept_id: t, label: 'x' })),
  }
}

describe('collectGraphHighlight', () => {
  const events = [ev('a', ['b']), ev('b', ['c']), ev('c', []), ev('d', ['b'])]

  it('downstream depth 1', () => {
    const set = collectGraphHighlight('a', events, {
      direction: 'down',
      maxDepth: 1,
      includeSiblings: false,
    })
    expect([...set].sort()).toEqual(['a', 'b'])
  })

  it('both directions includes upstream', () => {
    const set = collectGraphHighlight('b', events, {
      direction: 'both',
      maxDepth: 1,
      includeSiblings: false,
    })
    expect(set.has('a')).toBe(true)
    expect(set.has('b')).toBe(true)
    expect(set.has('c')).toBe(true)
    expect(set.has('d')).toBe(true)
  })

  it('siblings adds parallel children', () => {
    const set = collectGraphHighlight('b', events, {
      direction: 'up',
      maxDepth: 1,
      includeSiblings: true,
    })
    expect(set.has('d')).toBe(true)
  })
})

describe('buildGraphIndexes', () => {
  it('indexes parents and children', () => {
    const { children, parents } = buildGraphIndexes([ev('a', ['b']), ev('b', [])])
    expect(children.get('a')).toEqual(['b'])
    expect(parents.get('b')).toEqual(['a'])
  })
})
