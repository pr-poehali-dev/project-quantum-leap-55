import { useEffect, useMemo, useState } from "react"
import Icon from "@/components/ui/icon"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatSession {
  id: number
  messages: ChatMessage[]
  message_count: number
  page: string
  created_at: string
  updated_at: string
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

function ChatCard({ chat }: { chat: ChatSession }) {
  const [expanded, setExpanded] = useState(false)
  const firstQuestion = chat.messages.find((m) => m.role === "user")?.content || ""
  const shown = expanded ? chat.messages : []

  return (
    <div className="bg-white border border-neutral-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 md:p-6 flex items-start gap-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="w-10 h-10 bg-green-50 text-green-700 flex items-center justify-center shrink-0">
          <Icon name="MessagesSquare" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs text-neutral-400">№{chat.id}</span>
            <span className="text-xs px-2 py-0.5 font-medium bg-green-100 text-green-800">
              {chat.message_count} {chat.message_count === 1 ? "вопрос" : chat.message_count < 5 ? "вопроса" : "вопросов"}
            </span>
            <span className="text-xs text-neutral-500">{formatDate(chat.updated_at)}</span>
            {chat.page && <span className="text-xs text-neutral-400">страница: {chat.page}</span>}
          </div>
          <p className={`text-sm text-neutral-800 ${expanded ? "" : "line-clamp-2"}`}>{firstQuestion}</p>
        </div>
        <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={18} className="text-neutral-400 shrink-0 mt-1" />
      </button>

      {expanded && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 md:px-6 py-4 flex flex-col gap-3">
          {shown.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "self-end bg-green-600 text-white"
                  : "self-start bg-white text-neutral-800 border border-neutral-200"
              }`}
            >
              <p className={`text-[11px] mb-1 ${m.role === "user" ? "text-white/70" : "text-neutral-400"}`}>
                {m.role === "user" ? "Клиент" : "Консультант"}
              </p>
              {m.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminChats({ apiUrl, password, reloadKey }: { apiUrl: string; password: string; reloadKey: number }) {
  const [chats, setChats] = useState<ChatSession[] | null>(null)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false
    setError("")
    fetch(`${apiUrl}?type=chats`, { headers: { "X-Admin-Password": password } })
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) setError(data.error || "Ошибка загрузки")
        else setChats(data.chats)
      })
      .catch(() => !cancelled && setError("Нет связи с сервером"))
    return () => {
      cancelled = true
    }
  }, [apiUrl, password, reloadKey])

  const visible = useMemo(() => {
    if (!chats) return []
    const q = search.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) => c.messages.some((m) => m.content.toLowerCase().includes(q)))
  }, [chats, search])

  return (
    <>
      <div className="relative mb-5">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по тексту переписки"
          className="w-full bg-white border border-neutral-200 pl-9 pr-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!chats && !error ? (
        <div className="bg-white border border-neutral-200 py-16 text-center text-neutral-500">Загружаем переписки...</div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-neutral-200 py-16 text-center text-neutral-500">
          <Icon name="MessageSquareOff" fallback="Inbox" size={36} className="mx-auto mb-3 text-neutral-300" />
          Переписок пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((chat) => (
            <ChatCard key={chat.id} chat={chat} />
          ))}
        </div>
      )}
    </>
  )
}

export default AdminChats
