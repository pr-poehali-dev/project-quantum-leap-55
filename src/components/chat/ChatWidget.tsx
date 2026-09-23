import { useState, useRef, useEffect } from "react"
import Icon from "@/components/ui/icon"
import { useChatGPT } from "@/components/extensions/chatgpt-polza/useChatGPT"
import { CONSULTANT_PROMPT } from "./consultantPrompt"

const API_URL = "https://functions.poehali.dev/09afe605-ce0d-49c0-b801-2416360bf6e4"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Здравствуйте! Я ИИ-консультант СК ВЫСОТА. Расскажу об услугах, проектах, сроках и стоимости работ. Чем могу помочь?",
}

const QUICK_QUESTIONS = ["Сколько стоит строительство?", "Какие услуги вы оказываете?", "Какие гарантии?"]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState("")
  const { generate, isLoading } = useChatGPT({ apiUrl: API_URL })
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isLoading, open])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
    setMessages(next)
    setInput("")

    const result = await generate({
      model: "openai/gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 600,
      messages: [{ role: "system", content: CONSULTANT_PROMPT }, ...next.slice(-12)],
    })

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.success && result.content
          ? result.content
          : "Извините, сейчас не получается ответить. Позвоните нам: +7 909 153-00-33 или напишите на skvisotapro@mail.ru.",
      },
    ])
  }

  return (
    <>
      {open && (
        <div className="fixed z-[90] bottom-24 right-4 left-4 sm:left-auto sm:w-[380px] h-[70vh] max-h-[560px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-black/10">
          <div className="bg-green-600 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Icon name="Bot" size={20} />
              </div>
              <div>
                <p className="font-medium text-sm leading-tight">Консультант СК ВЫСОТА</p>
                <p className="text-xs text-white/80">Отвечает мгновенно</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1" aria-label="Закрыть чат">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-neutral-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl ${
                  m.role === "user"
                    ? "self-end bg-green-600 text-white rounded-br-sm"
                    : "self-start bg-white text-neutral-800 border border-black/5 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-white border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            )}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-green-600/40 text-green-700 bg-white hover:bg-green-600 hover:border-green-600 hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            className="border-t border-black/10 p-3 flex gap-2 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите вопрос..."
              className="flex-1 text-sm px-4 py-2.5 rounded-full bg-neutral-100 text-neutral-900 outline-none focus:ring-2 focus:ring-green-600/30"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors"
              aria-label="Отправить"
            >
              <Icon name="Send" size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed z-[90] bottom-5 right-5 w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label={open ? "Закрыть чат" : "Открыть чат с консультантом"}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />}
        <Icon name={open ? "X" : "MessageCircle"} size={28} className="relative" />
      </button>
    </>
  )
}

export default ChatWidget
