/**
 * Доступ к Supabase с сервера (secret-ключ, роль service_role — обходит RLS).
 * Обработчики получают объект Db через параметр, поэтому в тестах его легко подменить.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverEnv } from './env.js'

export interface AuthUser {
  id: string
  email: string | null
}

export interface SubscriptionRow {
  status: string
  plan: string | null
  current_period_end: string | null
  trial_end: string | null
  polar_customer_id: string | null
}

export interface ApplySubscriptionArgs {
  userId: string
  customerId: string | null
  subscriptionId: string
  status: string
  plan: string | null
  periodEnd: string | null
  trialEnd: string | null
  cancelAtPeriodEnd: boolean
  sourceAt: string | null
}

export interface Db {
  /** Проверяет access token Supabase Auth (запрос к Auth-серверу) */
  getUser(token: string): Promise<AuthUser | null>
  getSubscription(userId: string): Promise<SubscriptionRow | null>
  /** +delta к счётчику ИИ за день; -1 — лимит исчерпан */
  bumpAiUsage(userId: string, day: string, limit: number, delta?: number): Promise<number>
  applySubscription(args: ApplySubscriptionArgs): Promise<boolean>
  webhookSeen(id: string): Promise<boolean>
  markWebhook(id: string, type: string): Promise<void>
}

export const ACTIVE_STATUSES = new Set(['active', 'trialing'])
export const isProRow = (row: SubscriptionRow | null) => !!row && ACTIVE_STATUSES.has(row.status)

let admin: SupabaseClient | null = null
function client(): SupabaseClient {
  if (!admin) {
    admin = createClient(serverEnv.supabaseUrl(), serverEnv.supabaseSecretKey(), {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  }
  return admin
}

export const supabaseDb: Db = {
  async getUser(token) {
    const { data, error } = await client().auth.getUser(token)
    if (error || !data.user) return null
    return { id: data.user.id, email: data.user.email ?? null }
  },
  async getSubscription(userId) {
    const { data, error } = await client()
      .from('subscriptions')
      .select('status, plan, current_period_end, trial_end, polar_customer_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw new Error(`subscriptions select failed: ${error.code ?? ''}`)
    return (data as SubscriptionRow | null) ?? null
  },
  async bumpAiUsage(userId, day, limit, delta = 1) {
    const { data, error } = await client().rpc('bump_ai_usage', { p_user: userId, p_day: day, p_limit: limit, p_delta: delta })
    if (error) throw new Error(`bump_ai_usage failed: ${error.code ?? ''}`)
    return Number(data)
  },
  async applySubscription(a) {
    const { data, error } = await client().rpc('apply_polar_subscription', {
      p_user: a.userId,
      p_customer: a.customerId,
      p_subscription: a.subscriptionId,
      p_status: a.status,
      p_plan: a.plan,
      p_period_end: a.periodEnd,
      p_trial_end: a.trialEnd,
      p_cancel_at_period_end: a.cancelAtPeriodEnd,
      p_source_at: a.sourceAt,
    })
    if (error) throw new Error(`apply_polar_subscription failed: ${error.code ?? ''}`)
    return data === true
  },
  async webhookSeen(id) {
    const { data, error } = await client().from('webhook_events').select('id').eq('id', id).maybeSingle()
    if (error) throw new Error(`webhook_events select failed: ${error.code ?? ''}`)
    return !!data
  },
  async markWebhook(id, type) {
    const { error } = await client().from('webhook_events').upsert({ id, type }, { onConflict: 'id', ignoreDuplicates: true })
    if (error) throw new Error(`webhook_events insert failed: ${error.code ?? ''}`)
  },
}

/** Пользователь по заголовку Authorization: Bearer <access token> */
export async function userFromToken(db: Db, token: string | null): Promise<AuthUser | null> {
  if (!token) return null
  try {
    return await db.getUser(token)
  } catch {
    return null
  }
}
