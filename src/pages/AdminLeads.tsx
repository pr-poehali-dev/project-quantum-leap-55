import { useSeo } from "@/hooks/useSeo"
import { useEffect, useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { AdminChats } from "@/components/admin/AdminChats"
import { LeadManage, type LeadDocument } from "@/components/admin/LeadManage"
import { statusInfo } from "@/lib/leadStatus"

const API_URL = "https://functions.poehali.dev/d60bcfed-8ba1-4c96-8bce-942717961b03"
const STORAGE_KEY = "admin_leads_password"

interface LeadFile {
  name: string
  url: string
}

interface Lead {
  id: number
  name: string
  phone: string
  description: string
  source: string
  files: LeadFile[]
  email_sent: boolean
  created_at: string
  status: string
  user_id: number | null
  user_email: string
  user_name: string
  documents: LeadDocument[]
}

const SOURCE_LABELS: Record<string, { label: string; className: string }> = {
  calculation: { label: "Расчёт стоимости", className: "bg-amber-100 text-amber-800" },
  callback: { label: "Обратный звонок", className: "bg-sky-100 text-sky-800" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function isImage(name: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(name)
}

function LoginForm({ onLogin, error, loading }: { onLogin: (p: string) => void; error: string; loading: boolean }) {
  const [password, setPassword] = useState("")
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onLogin(password)
        }}
        className="bg-white w-full max-w-sm p-8 shadow-sm border border-neutral-200"
      >
        <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center mb-5">
          <Icon name="Lock" size={22} />
        </div>
        <h1 className="text-xl font-medium text-neutral-900 mb-1">Заявки с сайта</h1>
        <p className="text-sm text-neutral-500 mb-6">Введите пароль администратора</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 mb-3"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-neutral-900 text-white py-3 text-sm hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Проверяем..." : "Войти"}
        </button>
      </form>
    </div>
  )
}

interface LeadCardProps {
  lead: Lead
  apiUrl: string
  password: string
  onChanged: () => void
}

function LeadCard({ lead, apiUrl, password, onChanged }: LeadCardProps) {
  const st = statusInfo(lead.status)
  const src = SOURCE_LABELS[lead.source] || { label: lead.source, className: "bg-neutral-100 text-neutral-700" }
  return (
    <div className="bg-white border border-neutral-200 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-neutral-400">№{lead.id}</span>
        <span className={`text-xs px-2 py-0.5 font-medium ${src.className}`}>{src.label}</span>
        <span className="text-xs text-neutral-500">{formatDate(lead.created_at)}</span>
        <span className={`text-xs px-2 py-0.5 font-medium ${st.className}`}>{st.label}</span>
        {lead.user_id && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-800" title={lead.user_email}>
            <Icon name="UserCheck" size={12} />
            есть кабинет{lead.user_email ? `: ${lead.user_email}` : ""}
          </span>
        )}
        {!lead.email_sent && (
          <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500" title="Письмо на почту не отправилось">
            без письма
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 mb-3">
        <p className="text-lg font-medium text-neutral-900">{lead.name}</p>
        <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800">
          <Icon name="Phone" size={15} />
          {lead.phone}
        </a>
      </div>

      {lead.description && (
        <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed mb-3">{lead.description}</p>
      )}

      {lead.files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {lead.files.map((f) => (
            <a
              key={f.url}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 border border-neutral-200 hover:border-neutral-900 px-2 py-1.5 max-w-[260px] transition-colors"
            >
              {isImage(f.name) ? (
                <img src={f.url} alt="" className="w-9 h-9 object-cover shrink-0" />
              ) : (
                <span className="w-9 h-9 bg-neutral-100 flex items-center justify-center shrink-0">
                  <Icon name="FileText" size={16} className="text-neutral-500" />
                </span>
              )}
              <span className="text-xs text-neutral-700 truncate">{f.name}</span>
              <Icon name="ExternalLink" size={12} className="text-neutral-400 group-hover:text-neutral-900 shrink-0" />
            </a>
          ))}
        </div>
      )}

      <LeadManage
        apiUrl={apiUrl}
        password={password}
        leadId={lead.id}
        status={lead.status}
        documents={lead.documents || []}
        hasAccount={!!lead.user_id}
        onChanged={onChanged}
      />
    </div>
  )
}

export default function AdminLeads() {
  useSeo({ title: "Заявки — СК ВЫСОТА", noindex: true })
  const [password, setPassword] = useState<string>(() => sessionStorage.getItem(STORAGE_KEY) || "")
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "calculation" | "callback">("all")
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"leads" | "chats">("leads")
  const [reloadKey, setReloadKey] = useState(0)

  const load = async (pwd: string, silent = false) => {
    if (!silent) setLoading(true)
    setError("")
    try {
      const res = await fetch(API_URL, { headers: { "X-Admin-Password": pwd } })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки")
        if (res.status === 401) {
          sessionStorage.removeItem(STORAGE_KEY)
          setPassword("")
          setLeads(null)
        }
        return
      }
      sessionStorage.setItem(STORAGE_KEY, pwd)
      setPassword(pwd)
      setLeads(data.leads)
    } catch {
      setError("Нет связи с сервером")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (password) load(password)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    if (!leads) return []
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (filter !== "all" && l.source !== filter) return false
      if (!q) return true
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "\u0000") ||
        l.description.toLowerCase().includes(q)
      )
    })
  }, [leads, filter, search])

  if (!leads) {
    return <LoginForm onLogin={load} error={error} loading={loading} />
  }

  const counts = {
    all: leads.length,
    calculation: leads.filter((l) => l.source === "calculation").length,
    callback: leads.filter((l) => l.source === "callback").length,
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-medium">Панель СК ВЫСОТА</h1>
            <p className="text-xs text-white/60">СК ВЫСОТА · всего {leads.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (tab === "leads" ? load(password) : setReloadKey((k) => k + 1))}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/30 hover:bg-white/10 disabled:opacity-50"
            >
              <Icon name="RefreshCw" size={15} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Обновить</span>
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem(STORAGE_KEY)
                setPassword("")
                setLeads(null)
              }}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-white/30 hover:bg-white/10"
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 border-b border-neutral-300 mb-5">
          {([
            ["leads", "Заявки", "ClipboardList"],
            ["chats", "Переписки с консультантом", "MessagesSquare"],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 text-sm pb-3 -mb-px border-b-2 transition-colors ${
                tab === key ? "border-neutral-900 text-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>

        {tab === "chats" ? (
          <AdminChats apiUrl={API_URL} password={password} reloadKey={reloadKey} />
        ) : (
        <>
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="flex gap-1 bg-white border border-neutral-200 p-1">
            {([
              ["all", "Все"],
              ["calculation", "Расчёт"],
              ["callback", "Звонок"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-sm px-3 py-1.5 transition-colors ${
                  filter === key ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {label} <span className="opacity-60">{counts[key]}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, телефону или описанию"
              className="w-full bg-white border border-neutral-200 pl-9 pr-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {visible.length === 0 ? (
          <div className="bg-white border border-neutral-200 py-16 text-center text-neutral-500">
            <Icon name="Inbox" size={36} className="mx-auto mb-3 text-neutral-300" />
            Заявок не найдено
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((lead) => (
              <LeadCard key={lead.id} lead={lead} apiUrl={API_URL} password={password} onChanged={() => load(password, true)} />
            ))}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  )
}
