import { useState } from "react"
import Icon from "@/components/ui/icon"
import { FileAttachments, type AttachedFile } from "@/components/lead/FileAttachments"

const LEADS_URL = "https://functions.poehali.dev/e0b11d0c-3147-4a38-9d0a-17977fdefa27"

export function LeadForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [errorText, setErrorText] = useState("")

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
          description,
          files: files.filter((f) => f.status === "done").map((f) => ({ name: f.name, url: f.url })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorText(data.error || "Не удалось отправить заявку")
        setStatus("error")
        return
      }
      setStatus("sent")
      setName("")
      setPhone("")
      setDescription("")
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
                { icon: "Clock", text: "Перезвоним в течение рабочего дня" },
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
              <div className="text-center py-12">
                <Icon name="CheckCircle" size={56} className="mx-auto mb-5 text-green-500" />
                <h3 className="text-2xl font-medium mb-3 text-foreground">Заявка принята!</h3>
                <p className="text-muted-foreground mb-8">Мы свяжемся с вами в ближайшее время.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Описание объекта</label>
                  <textarea
                    rows={5}
                    maxLength={3000}
                    placeholder="Например: ангар 1000 м² под склад, Московская область, фундамент есть"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputClass} resize-none`}
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