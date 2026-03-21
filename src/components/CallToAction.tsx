import { ArrowRight, Phone } from "lucide-react"
import { HighlightedText } from "./HighlightedText"
import { useState } from "react"

function CallbackModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent("Заказ обратного звонка")
    const body = encodeURIComponent(`Имя: ${name}\nТелефон: ${phone}`)
    window.location.href = `mailto:sk.visota90@mail.ru?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors text-2xl leading-none">&times;</button>
        {sent ? (
          <div className="text-center py-8">
            <Phone className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-medium mb-2">Заявка отправлена!</h3>
            <p className="text-muted-foreground text-sm">Мы перезвоним вам в ближайшее время.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-medium mb-1">Обратный звонок</h3>
            <p className="text-muted-foreground text-sm mb-6">Оставьте номер — мы перезвоним в течение 15 минут</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                required
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              />
              <input
                type="tel"
                required
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              />
              <button type="submit" className="bg-foreground text-white px-6 py-3 text-sm hover:bg-foreground/80 transition-colors">
                Перезвоните мне
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export function CallToAction() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
    <section id="contact" className="py-32 md:py-29 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="tracking-[0.3em] uppercase mb-8 text-xl text-center text-amber-300">Для наших клиентов предусмотрена бесплатная консультация в телефонном разговоре или мессенджере, после короткого телефонного интервью мы можем дать Вам Ориентировочный диапазон стоимости (±15 %), и срока выполнения работ.</p>

          <h2 className="md:text-4xl lg:text-6xl leading-[1.1] tracking-tight mb-8 text-balance text-6xl font-thin"></h2>

          <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"></p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacts"
              className="inline-flex items-center justify-center gap-3 bg-primary-foreground text-foreground px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/90 transition-colors duration-300 group"
            >
              Написать нам
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="tel:+78001234567"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/10 transition-colors duration-300"
            >
              +7 (800) 123-45-67
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 border border-amber-400/60 text-amber-300 px-8 py-4 text-sm tracking-wide hover:bg-amber-400/10 transition-colors duration-300"
            >
              <Phone className="w-4 h-4" />
              Заказать звонок
            </button>
          </div>

          <div className="mt-16 pt-16 border-t border-primary-foreground/10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-medium text-primary-foreground mb-2">40+</p>
              <p className="text-primary-foreground/60 text-sm">реализованных объектов</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-primary-foreground mb-2">6 лет</p>
              <p className="text-primary-foreground/60 text-sm">экспертного опыта</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-primary-foreground mb-2">100%</p>
              <p className="text-primary-foreground/60 text-sm">результат </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    {showModal && <CallbackModal onClose={() => setShowModal(false)} />}
    </>
  )
}