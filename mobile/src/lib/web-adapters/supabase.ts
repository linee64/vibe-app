/**
 * Подмена веб-модуля src/lib/supabase.ts для React Native: тот же API (getSupabase, accessToken),
 * но сессия хранится в AsyncStorage, а не в localStorage браузера.
 * Общий веб-код (progressSync.ts, api.ts) получает этот модуль через Metro/Jest.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import { ENV, SUPABASE_ENABLED } from '../env'

let clientPromise: Promise<SupabaseClient | null> | null = null

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!SUPABASE_ENABLED) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        if (Platform.OS !== 'web') await import('react-native-url-polyfill/auto')
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(ENV.supabaseUrl, ENV.supabaseKey, {
          auth: {
            storage: AsyncStorage,
            storageKey: 'vaibik.auth',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          },
        })
        // токен обновляется только пока приложение на экране (рекомендация Supabase для RN)
        if (Platform.OS !== 'web') {
          AppState.addEventListener('change', (state) => {
            if (state === 'active') sb.auth.startAutoRefresh()
            else sb.auth.stopAutoRefresh()
          })
        }
        return sb
      } catch (e) {
        console.error('Supabase не загрузился', e)
        return null
      }
    })()
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
