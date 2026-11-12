/**
 * Разбор адреса, которым Supabase возвращает пользователя в приложение
 * (vaibik://callback?code=… или #access_token=…). Без зависимостей от Expo — чтобы тестировать в jest.
 */
export interface AuthCallback {
  code?: string
  accessToken?: string
  refreshToken?: string
  error?: string
}

export function parseAuthCallback(url: string): AuthCallback | null {
  if (!url || !/^[a-z][a-z0-9+.-]*:/i.test(url)) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash
  const hashParams = new URLSearchParams(hash)
  const get = (k: string) => parsed.searchParams.get(k) ?? hashParams.get(k) ?? undefined
  const code = get('code')
  const accessToken = get('access_token')
  const refreshToken = get('refresh_token')
  const error = get('error_description') ?? get('error') ?? get('error_code')
  if (!code && !accessToken && !error) return null
  return {
    ...(code ? { code } : {}),
    ...(accessToken ? { accessToken } : {}),
    ...(refreshToken ? { refreshToken } : {}),
    ...(error ? { error } : {}),
  }
}
