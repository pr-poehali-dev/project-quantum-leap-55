import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { useSeo } from "@/hooks/useSeo"
import { authRequest, oauthRedirectUri, saveAuth, takeOAuthReturn, takeOAuthState, type AuthUser } from "@/lib/auth"

export default function AuthCallback() {
  useSeo({ title: "Вход — СК ВЫСОТА", noindex: true })
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const q = new URLSearchParams(window.location.search)
    const code = q.get("code")
    const state = q.get("state")
    const saved = takeOAuthState()
    const returnTo = takeOAuthReturn()

    if (q.get("error")) {
      setError("Вход отменён")
      return
    }
    if (!code || !saved || saved.state !== state) {
      setError("Не удалось подтвердить вход. Попробуйте ещё раз")
      return
    }
    authRequest<{ token: string; user: AuthUser }>("oauth_callback", {
      provider: saved.provider,
      code,
      redirect_uri: oauthRedirectUri(),
    })
      .then((d) => {
        saveAuth(d.token, d.user)
        navigate(returnTo, { replace: true })
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка входа"))
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-sm w-full p-8 border border-neutral-200 text-center">
        {error ? (
          <>
            <Icon name="CircleAlert" size={36} className="mx-auto mb-3 text-red-500" />
            <p className="text-neutral-900 mb-5">{error}</p>
            <Link to="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm">
              Вернуться ко входу
            </Link>
          </>
        ) : (
          <>
            <Icon name="Loader2" size={36} className="mx-auto mb-3 text-green-600 animate-spin" />
            <p className="text-neutral-700">Выполняем вход...</p>
          </>
        )}
      </div>
    </div>
  )
}
