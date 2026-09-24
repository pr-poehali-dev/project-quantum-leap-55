import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { useSeo } from "@/hooks/useSeo"
import { authRequest, saveAuth, useAuth, type AuthUser } from "@/lib/auth"
import { OAuthButtons } from "@/components/account/OAuthButtons"

type Mode = "login" | "register" | "forgot" | "reset"

const inputClass =
  "w-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 bg-white outline-none focus:border-neutral-900 transition-colors"

export default function Login() {
  useSeo({ title: "Вход в личный кабинет — СК ВЫСОТА", noindex: true })
  const user = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get("return") || "/cabinet"
  const [mode, setMode] = useState<Mode>(params.get("mode") === "register" ? "register" : "login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [agree, setAgree] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    if (user) navigate(returnTo.startsWith("/") ? returnTo : "/cabinet", { replace: true })
  }, [user, navigate, returnTo])

  const switchMode = (m: Mode) => {
    setMode(m)
    setError("")
    setInfo("")
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    if (mode === "register" && !agree) {
      setError("Необходимо согласие на обработку персональных данных")
      return
    }
    setLoading(true)
    try {
      if (mode === "forgot") {
        await authRequest("forgot", { email })
        setInfo("Если такая почта зарегистрирована, мы отправили на неё код. Проверьте также папку «Спам».")
        setMode("reset")
        return
      }
      const payload =
        mode === "login"
          ? { email, password }
          : mode === "register"
            ? { email, password, name, phone }
            : { email, code, password }
      const data = await authRequest<{ token: string; user: AuthUser }>(mode, payload)
      saveAuth(data.token, data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Mode, [string, string]> = {
    login: ["Вход в личный кабинет", "Следите за заявками, получайте сметы и документы по объекту"],
    register: ["Регистрация", "Создайте кабинет, чтобы видеть статус заявок и документы"],
    forgot: ["Восстановление пароля", "Укажите почту, и мы пришлём код для смены пароля"],
    reset: ["Новый пароль", "Введите код из письма и придумайте новый пароль"],
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <header className="bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-white/80">
            <Icon name="ArrowLeft" size={16} />
            На сайт
          </Link>
          <span className="text-sm tracking-[0.2em] uppercase">СК ВЫСОТА</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white w-full max-w-md p-8 border border-neutral-200 shadow-sm">
          <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center mb-5">
            <Icon name={mode === "register" ? "UserPlus" : mode === "login" ? "User" : "KeyRound"} size={22} />
          </div>
          <h1 className="text-2xl font-light text-neutral-900 mb-1">{titles[mode][0]}</h1>
          <p className="text-sm text-neutral-500 mb-6">{titles[mode][1]}</p>

          {(mode === "login" || mode === "register") && (
            <>
              <OAuthButtons returnTo={returnTo} onError={setError} />
              <div className="flex items-center gap-3 my-5 text-xs text-neutral-400">
                <span className="flex-1 h-px bg-neutral-200" />
                или по почте
                <span className="flex-1 h-px bg-neutral-200" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" required className={inputClass} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон (необязательно)" type="tel" className={inputClass} />
              </>
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Электронная почта"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
            {mode === "reset" && (
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Код из письма" inputMode="numeric" required className={inputClass} />
            )}
            {mode !== "forgot" && (
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Пароль" : "Пароль (не короче 6 символов)"}
                type="password"
                required
                minLength={mode === "login" ? 1 : 6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={inputClass}
              />
            )}

            {mode === "register" && (
              <label className="flex items-start gap-2 text-xs text-neutral-500 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-green-600" />
                <span>
                  Согласен на обработку персональных данных в соответствии с{" "}
                  <Link to="/privacy" className="underline hover:text-neutral-900">политикой конфиденциальности</Link>
                </span>
              </label>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-green-700">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-sm transition-colors disabled:opacity-50"
            >
              {loading
                ? "Подождите..."
                : { login: "Войти", register: "Зарегистрироваться", forgot: "Получить код", reset: "Сохранить и войти" }[mode]}
            </button>
          </form>

          <div className="mt-6 text-sm text-neutral-600 space-y-2 text-center">
            {mode === "login" && (
              <>
                <p>
                  Нет кабинета?{" "}
                  <button onClick={() => switchMode("register")} className="text-green-700 hover:underline">Зарегистрироваться</button>
                </p>
                <p>
                  <button onClick={() => switchMode("forgot")} className="text-neutral-500 hover:text-neutral-900 hover:underline">Забыли пароль?</button>
                </p>
              </>
            )}
            {mode !== "login" && (
              <p>
                Уже есть кабинет?{" "}
                <button onClick={() => switchMode("login")} className="text-green-700 hover:underline">Войти</button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
