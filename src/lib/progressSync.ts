/**
 * Синхронизация прогресса с Supabase (таблица public.progress, одна jsonb-строка на пользователя).
 * Стор остаётся единственным источником правды для UI: тут только загрузка/сохранение и слияние.
 */
import type { Progress } from '../store'
import { getSupabase } from './supabase'

const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])]
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : d)
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length <= 64).slice(0, 500) : [])
const day = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '')

/** Аккуратно читаем то, что пришло из БД (там может оказаться что угодно) */
export function sanitizeRemote(raw: unknown): Partial<Progress> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  return {
    completed: strArr(r.completed),
    xp: num(r.xp),
    gems: num(r.gems),
    hearts: num(r.hearts, 5),
    streak: num(r.streak),
    todayXp: num(r.todayXp),
    perfectToday: num(r.perfectToday),
    lessonsToday: num(r.lessonsToday),
    lastDay: day(r.lastDay),
    homework: strArr(r.homework),
    tiersByTest: strArr(r.tiersByTest),
    tiersCelebrated: strArr(r.tiersCelebrated),
    placementSeen: r.placementSeen === true,
    portfolioUrl: typeof r.portfolioUrl === 'string' ? r.portfolioUrl.slice(0, 300) : '',
  }
}

/**
 * Слияние «ничего не теряем»: множества — объединяем, счётчики — максимум,
 * дневные счётчики — от более свежего дня. unlockAll — локальная настройка, из облака не берём.
 */
export function mergeProgress(local: Progress, remote: Partial<Progress> | null): Progress {
  if (!remote) return local
  const rDay = remote.lastDay ?? ''
  let dayPart: Pick<Progress, 'lastDay' | 'todayXp' | 'perfectToday' | 'lessonsToday'>
  if (rDay > local.lastDay) {
    dayPart = { lastDay: rDay, todayXp: remote.todayXp ?? 0, perfectToday: remote.perfectToday ?? 0, lessonsToday: remote.lessonsToday ?? 0 }
  } else if (rDay === local.lastDay) {
    dayPart = {
      lastDay: rDay,
      todayXp: Math.max(local.todayXp, remote.todayXp ?? 0),
      perfectToday: Math.max(local.perfectToday, remote.perfectToday ?? 0),
      lessonsToday: Math.max(local.lessonsToday, remote.lessonsToday ?? 0),
    }
  } else {
    dayPart = { lastDay: local.lastDay, todayXp: local.todayXp, perfectToday: local.perfectToday, lessonsToday: local.lessonsToday }
  }
  return {
    ...local,
    ...dayPart,
    completed: union(local.completed, remote.completed),
    homework: union(local.homework, remote.homework),
    tiersByTest: union(local.tiersByTest, remote.tiersByTest),
    tiersCelebrated: union(local.tiersCelebrated, remote.tiersCelebrated),
    xp: Math.max(local.xp, remote.xp ?? 0),
    gems: Math.max(local.gems, remote.gems ?? 0),
    streak: Math.max(local.streak, remote.streak ?? 0),
    hearts: Math.min(local.hearts, remote.hearts ?? local.hearts),
    placementSeen: local.placementSeen || !!remote.placementSeen,
    portfolioUrl: local.portfolioUrl || remote.portfolioUrl || '',
  }
}

/** null — записи ещё нет; бросает исключение при сетевой/серверной ошибке */
export async function loadRemoteProgress(userId: string): Promise<Partial<Progress> | null> {
  const sb = await getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('progress').select('data').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? sanitizeRemote(data.data) : null
}

export async function saveRemoteProgress(userId: string, p: Progress): Promise<void> {
  const sb = await getSupabase()
  if (!sb) return
  // unlockAll — локальная демо-настройка, в облако не пишем
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { unlockAll, ...data } = p
  const { error } = await sb.from('progress').upsert({ user_id: userId, data }, { onConflict: 'user_id' })
  if (error) throw error
}

/** Сохранить сданную домашку (история попыток для будущей аналитики/модерации). Ошибки не критичны. */
export async function recordHomeworkSubmission(homeworkId: string, prompts: string[], passed: boolean): Promise<void> {
  try {
    const sb = await getSupabase()
    if (!sb) return
    await sb.from('homework_submissions').insert({
      homework_id: homeworkId,
      prompts: prompts.slice(-6).map((t) => t.slice(0, 2000)),
      passed,
    })
  } catch {
    /* не мешаем учёбе */
  }
}
