import { Header } from "@/components/Header"
import Icon from "@/components/ui/icon"
import { useState } from "react"

const managers = [
  {
    name: "Иван Иванов",
    role: "Исполнительный директор",
    specialty: "Управление проектами",
    phone: "+7 800 123-45-67",
    phoneHref: "tel:+78001234567",
    whatsapp: "https://wa.me/78001234567",
    email: "director@example.ru",
    photo: null,
  },
  {
    name: "Иван Иванов",
    role: "Руководитель отдела продаж",
    specialty: "Малоэтажное строительство",
    phone: "+7 800 123-45-67",
    phoneHref: "tel:+78001234567",
    whatsapp: "https://wa.me/78001234567",
    email: "i.ivanov@example.ru",
    photo: null,
  },
]

interface ModalProps {
  manager: typeof managers[0]
  onClose: () => void
}

function ConsultModal({ manager, onClose }: ModalProps) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Вопрос для ${manager.name}`)
    const body = encodeURIComponent(`Имя: ${name}\n\n${message}`)
    window.location.href = `mailto:sk.visota90@mail.ru?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors">
          <Icon name="X" size={20} />
        </button>
        {sent ? (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-medium mb-2">Вопрос отправлен!</h3>
            <p className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-medium mb-1">Задать вопрос</h3>
            <p className="text-muted-foreground text-sm mb-6">{manager.name} · {manager.specialty}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                required
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              />
              <textarea
                required
                placeholder="Ваш вопрос"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
              />
              <button
                type="submit"
                className="bg-foreground text-white px-6 py-3 text-sm hover:bg-foreground/80 transition-colors"
              >
                Отправить
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Contacts() {
  const [modalManager, setModalManager] = useState<typeof managers[0] | null>(null)

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundImage: "url('https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/54b87bdd-1f9e-409b-930f-5897357aaa3c.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header />

      <main className="pt-40 pb-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-16">
            <p className="text-white/50 text-sm tracking-[0.3em] uppercase mb-6">Контакты</p>
            <h1 className="text-6xl font-thin leading-[1.15] tracking-tight mb-6 text-white">
              Свяжитесь с нами
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Наши специалисты готовы ответить на вопросы и подготовить расчёт для вашего проекта.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {managers.map((manager) => (
              <div key={manager.email} className="border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col gap-5">
                <div className="w-20 h-20 bg-white/10 flex items-center justify-center">
                  {manager.photo ? (
                    <img src={manager.photo} alt={manager.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="User" size={32} className="text-white/40" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-1 text-white">{manager.name}</h3>
                  <p className="text-white/50 text-sm">{manager.role}</p>
                  <p className="text-white/50 text-sm">{manager.specialty}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <a href={manager.phoneHref} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                    <Icon name="Phone" size={16} />
                    {manager.phone}
                  </a>
                  <a href={`mailto:${manager.email}`} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                    <Icon name="Mail" size={16} />
                    {manager.email}
                  </a>
                  <a href={manager.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors">
                    <Icon name="MessageCircle" size={16} />
                    WhatsApp
                  </a>
                </div>

                <button
                  onClick={() => setModalManager(manager)}
                  className="mt-auto border border-white/30 text-white text-sm px-5 py-2.5 hover:bg-white hover:text-foreground transition-all duration-300"
                >
                  Задать вопрос
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-16 grid md:grid-cols-3 gap-10">
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-white/40 mb-3">Email</p>
              <a href="mailto:sk.visota90@mail.ru" className="text-lg text-white hover:text-white/70 transition-colors">
                sk.visota90@mail.ru
              </a>
            </div>
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-white/40 mb-3">Телефон</p>
              <a href="tel:+78001234567" className="text-lg text-white hover:text-white/70 transition-colors">
                +7 (800) 123-45-67
              </a>
            </div>
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-white/40 mb-3">Режим работы</p>
              <p className="text-lg text-white">Пн–Пт, 9:00–18:00</p>
            </div>
          </div>
        </div>
      </main>

      {modalManager && <ConsultModal manager={modalManager} onClose={() => setModalManager(null)} />}
    </div>
  )
}