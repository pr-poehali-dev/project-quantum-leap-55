import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { FileAttachments, type AttachedFile } from "@/components/lead/FileAttachments"

const LEADS_URL = "https://functions.poehali.dev/e0b11d0c-3147-4a38-9d0a-17977fdefa27"

interface SentResult {
  files: { name: string; url: string }[]
  links: string[]
}

export function LeadForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [region, setRegion] = useState("")
  const [description, setDescription] = useState("")
  const [docLink, setDocLink] = useState("")
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [errorText, setErrorText] = useState("")
  const [sentResult, setSentResult] = useState<SentResult | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const service = (e as CustomEvent<string>).detail
      if (!service) return
      setDescription((prev) => (prev ? prev : `Услуга: ${service}\n`))
    }
    window.addEventListener("prefillLeadForm", handler)
    return () => window.removeEventListener("prefillLeadForm", handler)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.some((f) => f.status === "uploading")) {
      setErrorText("Дождитесь загрузки файлов")
      setStatus("error")
      return
    }
    setStatus("loading")
    setErrorText("")
    try {
      const res = await fetch(LEADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          region,
          description,
          files: files.filter((f) => f.status === "done").map((f) => ({ name: f.name, url: f.url })),
          links: docLink.trim() ? [docLink.trim()] : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorText(data.error || "Не удалось отправить заявку")
        setStatus("error")
        return
      }
      setSentResult({ files: data.files || [], links: data.links || [] })
      setStatus("sent")
      setName("")
      setPhone("")
      setRegion("")
      setDescription("")
      setDocLink("")
      setFiles([])
    } catch {
      setErrorText("Нет связи. Попробуйте ещё раз или позвоните нам.")
      setStatus("error")
    }
  }

  const inputClass =
    "w-full bg-white border border-border px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"

  return (
    <section id="lead-form" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Бесплатный расчёт</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight font-thin mb-6 leading-[1.15]">
              Узнайте стоимость вашего объекта
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md">
              Опишите, какие работы необходимо выполнить, и приложите фотографии объекта или рабочую документацию, если они есть. Мы изучим материалы, уточним детали и подготовим предварительный расчёт стоимости и сроков.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "Clock", text: "Ответим в течение 1 рабочего дня" },
                { icon: "Calculator", text: "Предварительный расчёт стоимости и сроков" },
                { icon: "ShieldCheck", text: "Бесплатно и ни к чему не обязывает" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-foreground">
                  <span className="w-10 h-10 bg-foreground text-primary-foreground flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-border p-6 md:p-10 shadow-sm">
            {status === "sent" ? (
              <div className="text-center py-10">
                <Icon name="CheckCircle" size={56} className="mx-auto mb-5 text-green-500" />
                <h3 className="text-2xl font-medium mb-3 text-foreground">Заявка принята!</h3>
                <p className="text-muted-foreground mb-2">Мы изучим объект и свяжемся с вами в течение 1 рабочего дня.</p>

                {sentResult && (sentResult.files.length > 0 || sentResult.links.length > 0) && (
                  <div className="text-left bg-secondary/60 border border-border p-4 mt-6 mb-2">
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Принято вместе с заявкой</p>
                    <ul className="space-y-2">
                      {sentResult.files.map((f) => (
                        <li key={f.url} className="flex items-center gap-2 text-sm text-foreground">
                          <Icon name="Paperclip" size={14} className="text-muted-foreground shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </li>
                      ))}
                      {sentResult.links.map((l) => (
                        <li key={l} className="flex items-center gap-2 text-sm text-foreground">
                          <Icon name="Link" size={14} className="text-muted-foreground shrink-0" />
                          <span className="truncate">{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setStatus("idle")
                    setSentResult(null)
                  }}
                  className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground mt-6"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Имя</label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      placeholder="Как к вам обращаться"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Телефон</label>
                    <input
                      type="tel"
                      required
                      maxLength={50}
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Регион объекта <span className="normal-case tracking-normal">(необязательно)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="Например: Московская область"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Описание объекта <span className="normal-case tracking-normal">(необязательно)</span>
                  </label>
                  <textarea
                    rows={4}
                    maxLength={3000}
                    placeholder="Например: ангар 1000 м² под склад, фундамент есть"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Ссылка на документацию <span className="normal-case tracking-normal">(необязательно)</span>
                  </label>
                  <input
                    type="url"
                    maxLength={500}
                    placeholder="Ссылка на Google Диск, Яндекс.Диск и т.п."
                    value={docLink}
                    onChange={(e) => setDocLink(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <FileAttachments files={files} onChange={setFiles} />

                {status === "error" && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} />
                    {errorText}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || files.some((f) => f.status === "uploading")}
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 py-4 text-sm tracking-wide hover:bg-foreground/85 transition-colors disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <>
                      <Icon name="Loader2" size={18} className="animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    <>
                      Получить расчёт бесплатно
                      <Icon name="ArrowRight" size={18} />
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LeadForm