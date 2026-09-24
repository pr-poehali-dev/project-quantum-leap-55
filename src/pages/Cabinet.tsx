import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { useSeo } from "@/hooks/useSeo"
import { CABINET_URL, authHeaders, clearAuth, logout, useAuth } from "@/lib/auth"
import { CabinetLeads, CabinetDocuments, formatDate, type CabinetLead } from "@/components/account/CabinetLeads"
import { CabinetProfile } from "@/components/account/CabinetProfile"

interface CabinetChat {
  id: number
  messages: { role: "user" | "assistant"; content: string }[]
  message_count: number
  updated_at: string
}

type Tab = "leads" | "documents" | "chats" | "profile"

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "leads", label: "Мои заявки", icon: "ClipboardList" },
  { key: "documents", label: "Документы", icon: "FolderOpen" },
  { key: "chats", label: "Переписка", icon: "MessagesSquare" },
  { key: "profile", label: "Профиль", icon: "UserCog" },
]

function ChatHistory({ chats }: { chats: CabinetChat[] }) {
  const [openId, setOpenId] = useState<number | null>(chats[0]?.id ?? null)
  if (chats.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 py-14 px-6 text-center text-neutral-500">
        <Icon name="MessagesSquare" size={36} className="mx-auto mb-3 text-neutral-300" />
        Здесь сохранятся Ваши разговоры с консультантом. Откройте чат в правом нижнем углу, чтобы задать вопрос.
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {chats.map((c) => {
        const open = openId === c.id
        const first = c.messages.find((m) => m.role === "user")?.content || ""
        return (
          <div key={c.id} className="bg-white border border-neutral-200">
            <button onClick={() => setOpenId(open ? null : c.id)} className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-neutral-50">
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-neutral-500 mb-0.5">{formatDate(c.updated_at, true)}</span>
                <span className="block text-sm text-neutral-900 truncate">{first}</span>
              </span>
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-neutral-400 shrink-0" />
            </button>
            {open && (
              <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-4 flex flex-col gap-2.5">
                {c.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === "user" ? "self-end bg-green-600 text-white" : "self-start bg-white text-neutral-800 border border-neutral-200"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Cabinet() {
  useSeo({ title: "Личный кабинет — СК ВЫСОТА", noindex: true })
  const user = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.key === params.get("tab"))?.key || "leads") as Tab
  const [leads, setLeads] = useState<CabinetLead[] | null>(null)
  const [chats, setChats] = useState<CabinetChat[]>([])
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const res = await fetch(CABINET_URL, { headers: authHeaders() })
      const data = await res.json()
      if (res.status === 401) {
        clearAuth()
        return
      }
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки")
      setLeads(data.leads)
      setChats(data.chats)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Нет связи с сервером")
    }
  }, [])

  useEffect(() => {
    if (!user) {
      navigate("/login?return=/cabinet", { replace: true })
      return
    }
    load()
  }, [user, navigate, load])

  if (!user) return null

  const goNewLead = () => {
    navigate("/")
    setTimeout(() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" }), 400)
  }

  const docCount = leads?.reduce((n, l) => n + l.documents.length, 0) || 0

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-white/80">
            <Icon name="ArrowLeft" size={16} />
            <span className="hidden sm:inline">На сайт</span>
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-sm truncate max-w-[160px]">{user.name || user.email}</span>
            <button
              onClick={async () => {
                await logout()
                navigate("/")
              }}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/30 hover:bg-white/10"
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-light text-neutral-900">Личный кабинет</h1>
            <p className="text-sm text-neutral-500 mt-1">Здравствуйте{user.name ? `, ${user.name}` : ""}! Здесь собраны Ваши заявки и документы.</p>
          </div>
          <button onClick={goNewLead} className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm">
            <Icon name="Plus" size={16} />
            Новая заявка
          </button>
        </div>

        <div className="flex gap-5 overflow-x-auto border-b border-neutral-300 mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setParams(t.key === "leads" ? {} : { tab: t.key }, { replace: true })}
              className={`inline-flex items-center gap-2 text-sm pb-3 -mb-px border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key ? "border-green-600 text-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.key === "documents" && docCount > 0 && (
                <span className="text-[11px] bg-green-600 text-white px-1.5 rounded-full">{docCount}</span>
              )}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {tab === "profile" ? (
          <CabinetProfile user={user} />
        ) : leads === null ? (
          <div className="bg-white border border-neutral-200 py-16 text-center text-neutral-500">
            <Icon name="Loader2" size={28} className="mx-auto mb-2 animate-spin text-neutral-400" />
            Загружаем данные...
          </div>
        ) : tab === "leads" ? (
          <CabinetLeads leads={leads} onNewLead={goNewLead} />
        ) : tab === "documents" ? (
          <CabinetDocuments leads={leads} />
        ) : (
          <ChatHistory chats={chats} />
        )}
      </main>
    </div>
  )
}
