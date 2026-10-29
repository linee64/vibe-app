import { beforeEach, describe, expect, it, vi } from 'vitest'

// узел без DOM: подставляем минимальные localStorage/window
const store = new Map<string, string>()
vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) })
vi.stubGlobal('window', { dispatchEvent: () => true, location: { hash: '' }, innerWidth: 360, innerHeight: 682 })
vi.stubGlobal('Event', class {})
vi.mock('../../src/lib/supabase', () => ({ accessToken: async () => null, getSupabase: async () => null }))

const { claimInlinePrompt, pendingMicroPrompt } = await import('../../src/lib/feedback')

describe('инлайн-оценка первого урока', () => {
  beforeEach(() => store.clear())
  it('показывается один раз и не ставит карточку в очередь на пути', () => {
    expect(claimInlinePrompt('first_lesson')).toBe(true)
    expect(claimInlinePrompt('first_lesson')).toBe(false)
    expect(pendingMicroPrompt()).toBeNull()
  })
})
