import { useEffect, useState } from "react"
import { AUTH_URL, startOAuth } from "@/lib/auth"

type Provider = "yandex"

function YandexMark() {
  return (
    <span className="w-5 h-5 rounded-full bg-[#FC3F1D] text-white text-[13px] font-bold flex items-center justify-center leading-none">
      Я
    </span>
  )
}

export function OAuthButtons({ returnTo = "/cabinet", onError }: { returnTo?: string; onError: (msg: string) => void }) {
  const [providers, setProviders] = useState<Provider[] | null>(null)
  const [busy, setBusy] = useState<Provider | null>(null)

  useEffect(() => {
    fetch(`${AUTH_URL}&action=providers`)
      .then((r) => r.json())
      .then((d) => setProviders(Array.isArray(d.providers) ? d.providers : []))
      .catch(() => setProviders([]))
  }, [])

  const go = async (p: Provider) => {
    setBusy(p)
    onError("")
    try {
      await startOAuth(p, returnTo)
    } catch (e) {
      onError(e instanceof Error ? e.message : "Не удалось начать вход")
      setBusy(null)
    }
  }

  const items: { key: Provider; label: string; mark: JSX.Element }[] = [
    { key: "yandex", label: "Войти с Яндекс ID", mark: <YandexMark /> },
  ]

  return (
    <div className="space-y-2">
      {items.map((it) => {
        const enabled = providers?.includes(it.key)
        return (
          <button
            key={it.key}
            type="button"
            disabled={!enabled || busy !== null}
            onClick={() => go(it.key)}
            title={providers && !enabled ? "Скоро будет доступно" : undefined}
            className="w-full flex items-center justify-center gap-3 border border-neutral-300 bg-white text-neutral-900 py-3 text-sm hover:border-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {it.mark}
            {busy === it.key ? "Переходим..." : it.label}
            {providers && !enabled && <span className="text-xs text-neutral-400">(скоро)</span>}
          </button>
        )
      })}
    </div>
  )
}

export default OAuthButtons