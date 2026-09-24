import { useState } from "react"
import Icon from "@/components/ui/icon"
import { authRequest, saveUser, startOAuth, type AuthUser } from "@/lib/auth"

const inputClass =
  "w-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 bg-white outline-none focus:border-neutral-900"

export function CabinetProfile({ user }: { user: AuthUser }) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const d = await authRequest<{ user: AuthUser }>("update_profile", { name, phone })
      saveUser(d.user)
      setMsg({ ok: true, text: "Данные сохранены. Теперь они будут подставляться в заявки автоматически" })
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Ошибка" })
    } finally {
      setLoading(false)
    }
  }

  const link = (p: "yandex" | "google") =>
    startOAuth(p, "/cabinet?tab=profile").catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Ошибка" }))

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form onSubmit={save} className="bg-white border border-neutral-200 p-6 space-y-3">
        <h3 className="font-medium text-neutral-900 mb-2">Контактные данные</h3>
        <label className="block text-xs text-neutral-500">
          Имя
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-xs text-neutral-500">
          Телефон
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+7" className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-xs text-neutral-500">
          Почта
          <input value={user.email} disabled className={`${inputClass} mt-1 bg-neutral-50 text-neutral-500`} />
        </label>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
        <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm disabled:opacity-50">
          {loading ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>

      <div className="bg-white border border-neutral-200 p-6">
        <h3 className="font-medium text-neutral-900 mb-1">Способы входа</h3>
        <p className="text-xs text-neutral-500 mb-4">Привяжите аккаунт, чтобы входить в один клик</p>
        <div className="space-y-2">
          {([
            ["yandex", "Яндекс ID", user.yandex],
            ["google", "Google", user.google],
          ] as const).map(([key, label, linked]) => (
            <div key={key} className="flex items-center justify-between border border-neutral-200 px-4 py-3">
              <span className="text-sm text-neutral-800">{label}</span>
              {linked ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-700">
                  <Icon name="Check" size={14} /> привязан
                </span>
              ) : (
                <button onClick={() => link(key)} className="text-xs text-green-700 hover:underline">
                  Привязать
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between border border-neutral-200 px-4 py-3">
            <span className="text-sm text-neutral-800">Почта и пароль</span>
            {user.has_password ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-700">
                <Icon name="Check" size={14} /> настроен
              </span>
            ) : (
              <span className="text-xs text-neutral-400">не задан</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CabinetProfile
