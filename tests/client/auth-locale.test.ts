import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Поддельный клиент Supabase: запоминаем, с чем вызывали auth.*
const calls: { signUp: unknown[]; updateUser: unknown[][] } = { signUp: [], updateUser: [] }
let sessionUser: { user_metadata?: Record<string, unknown> } | null = null
const fake = {
  auth: {
    signUp: vi.fn(async (args: unknown) => {
      calls.signUp.push(args)
      return { data: { user: { identities: [{}] }, session: null }, error: null }
    }),
    updateUser: vi.fn(async (...args: unknown[]) => {
      calls.updateUser.push(args)
      return { data: {}, error: null }
    }),
    getSession: vi.fn(async () => ({ data: { session: sessionUser ? { user: sessionUser } : null } })),
  },
}
vi.mock('../../src/lib/supabase', () => ({ getSupabase: async () => fake }))

const { setLocale } = await import('../../src/i18n/core')
const auth = await import('../../src/lib/auth')

beforeEach(() => {
  vi.stubGlobal('window', { location: { origin: 'https://vaibik.test', pathname: '/' } })
  calls.signUp = []
  calls.updateUser = []
  sessionUser = null
})
afterEach(async () => {
  vi.unstubAllGlobals()
  await setLocale('ru', { persist: false })
})

describe('locale в user_metadata (язык писем Supabase)', () => {
  it('signUp передаёт текущий язык и имя', async () => {
    await setLocale('kk', { persist: false })
    const res = await auth.signUp('a@b.kz', 'secret123', '  Айдар ')
    expect(res).toMatchObject({ ok: true, needsConfirm: true })
    expect(calls.signUp[0]).toMatchObject({
      email: 'a@b.kz',
      options: { emailRedirectTo: 'https://vaibik.test/', data: { locale: 'kk', display_name: 'Айдар' } },
    })
  })

  it('signUp без имени всё равно передаёт язык', async () => {
    await setLocale('ru', { persist: false })
    await auth.signUp('a@b.ru', 'secret123')
    expect((calls.signUp[0] as { options: { data: unknown } }).options.data).toEqual({ locale: 'ru' })
  })

  it('changeEmail передаёт язык вместе с новой почтой', async () => {
    await setLocale('es', { persist: false })
    await auth.changeEmail('new@b.es')
    expect(calls.updateUser[0]).toEqual([{ email: 'new@b.es', data: { locale: 'es' } }, { emailRedirectTo: 'https://vaibik.test/' }])
  })

  it('syncAuthLocale пишет язык, только если он отличается', async () => {
    await setLocale('zh', { persist: false })
    sessionUser = { user_metadata: { locale: 'zh' } }
    await auth.syncAuthLocale()
    expect(calls.updateUser).toHaveLength(0)
    sessionUser = { user_metadata: { locale: 'ru' } }
    await auth.syncAuthLocale()
    expect(calls.updateUser[0]).toEqual([{ data: { locale: 'zh' } }])
  })

  it('syncAuthLocale без сессии ничего не делает', async () => {
    await auth.syncAuthLocale()
    expect(calls.updateUser).toHaveLength(0)
  })
})
