/** Stable key consumed by SPA + documented in issue #10; keep in sync with Playwright helpers. */
export const POSITION_STORAGE_KEY = 'clio-node-positions-v5-chart-autosize'
const STORAGE_KEY = POSITION_STORAGE_KEY
interface StoredPositions {
  [conceptId: string]: { x: number; y: number }
}

export function loadPositions(): StoredPositions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredPositions) : {}
  } catch {
    return {}
  }
}

export function savePositions(positions: StoredPositions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

export function clearPositions(): void {
  localStorage.removeItem(STORAGE_KEY)
}
