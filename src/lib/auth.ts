import { useEffect, useState } from "react"

export const ACCOUNT_URL = "https://functions.poehali.dev/d47c89a4-0460-4384-875a-5d2114146ac2"
export const AUTH_URL = `${ACCOUNT_URL}?area=auth`
export const CABINET_URL = `${ACCOUNT_URL}?area=cabinet`

const TOKEN_KEY = "skvisota_auth_token"
const USER_KEY = "skvisota_auth_user"
const EVENT = "skvisota-auth-change"

export interface AuthUser {
  id: number
  email: string
  name: string
  phone: string
  avatar: string
  yandex: boolean
  has_password: boolean
}

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || ""
  } catch {
    return ""
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(EVENT))
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(EVENT))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { "X-Auth-Token": token } : {}
}

export async function authRequest<T = Record<string, unknown>>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ action, ...body }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && getToken() && action !== "login") clearAuth()
    throw new Error(data.error || "Что-то пошло не так. Попробуйте ещё раз")
  }
  return data as T
}

export async function logout() {
  try {
    await authRequest("logout")
  } catch {
    /* ignore */
  }
  clearAuth()
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => (getToken() ? getStoredUser() : null))
  useEffect(() => {
    const sync = () => setUser(getToken() ? getStoredUser() : null)
    window.addEventListener(EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  return user
}

const OAUTH_STATE_KEY = "skvisota_oauth_state"
const OAUTH_RETURN_KEY = "skvisota_oauth_return"

export function oauthRedirectUri() {
  return `${window.location.origin}/auth/callback`
}

export async function startOAuth(provider: "yandex", returnTo = "/cabinet") {
  const url = `${AUTH_URL}&action=oauth_url&provider=${provider}&redirect_uri=${encodeURIComponent(oauthRedirectUri())}`
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || "Не удалось начать вход")
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ state: data.state, provider }))
  sessionStorage.setItem(OAUTH_RETURN_KEY, returnTo)
  window.location.href = data.url
}

export function takeOAuthState(): { state: string; provider: "yandex" } | null {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY)
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function takeOAuthReturn(): string {
  const v = sessionStorage.getItem(OAUTH_RETURN_KEY) || "/cabinet"
  sessionStorage.removeItem(OAUTH_RETURN_KEY)
  return v.startsWith("/") ? v : "/cabinet"
}