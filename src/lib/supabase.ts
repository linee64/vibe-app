/**
 * Клиент Supabase для браузера (publishable-ключ). Если переменные не заданы — null, приложение в демо-режиме.
 * Библиотека грузится динамически, поэтому в демо-сборке её код даже не скачивается.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ENABLED, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config'

let clientPromise: Promise<SupabaseClient | null> | null = null

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!SUPABASE_ENABLED) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // PKCE: ссылки из писем возвращают ?code=… в query, а не в #hash — не ломает наш hash-роутинг
            flowType: 'pkce',
            storageKey: 'vaibik.auth',
          },
        }),
      )
      .catch((e) => {
        console.error('Supabase не загрузился', e)
        return null
      })
  }
  return clientPromise
}

/** Текущий access token (для запросов к /api) */
export async function accessToken(): Promise<string | null> {
  const sb = await getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session?.access_token ?? null
}
