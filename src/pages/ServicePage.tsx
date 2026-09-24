import { Link, useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { LeadForm } from "@/components/LeadForm"
import Icon from "@/components/ui/icon"
import { useSeo } from "@/hooks/useSeo"
import { services } from "@/data/services"
import NotFound from "./NotFound"

function scrollToForm() {
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })
}

export default function ServicePage() {
  const { slug } = useParams()
  const service = services.find((s) => s.slug === slug)

  useSeo({
    title: service?.seoTitle || "Услуга не найдена — СК ВЫСОТА",
    description: service?.seoDescription,
    noindex: !service,
  })

  if (!service) return <NotFound />

  const others = services.filter((s) => s.slug !== service.slug)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-foreground text-primary-foreground pt-40 pb-20 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <nav className="text-sm text-primary-foreground/60 mb-8 flex flex-wrap items-center gap-2" aria-label="Навигация">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <Link to="/uslugi" className="hover:text-primary-foreground transition-colors">Услуги</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-primary-foreground/90">{service.menuTitle}</span>
          </nav>
          <div className="max-w-4xl">
            <Icon name={service.icon} fallback="Building2" size={44} className="text-amber-400 mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin leading-[1.1] tracking-tight mb-8">{service.h1}</h1>
            <p className="text-lg md:text-xl text-primary-foreground/75 leading-relaxed max-w-3xl mb-10">{service.intro}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-foreground px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/90 transition-colors"
              >
                Бесплатный расчёт
                <Icon name="ArrowRight" size={16} />
              </button>
              <a
                href="tel:+79091530033"
                className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/10 transition-colors"
              >
                <Icon name="Phone" size={16} />
                +7 909 153-00-33
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-thin tracking-tight mb-8">Что мы выполняем</h2>
            <ul className="space-y-4">
              {service.works.map((w) => (
                <li key={w} className="flex gap-3 text-foreground">
                  <Icon name="Check" size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-thin tracking-tight mb-8">Как мы работаем</h2>
            <ol className="space-y-5">
              {service.steps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="w-9 h-9 shrink-0 bg-foreground text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-foreground pt-1.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-thin tracking-tight mb-10">Почему выбирают СК ВЫСОТА</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.advantages.map((a) => (
              <div key={a} className="bg-white border border-border p-6">
                <Icon name="ShieldCheck" size={24} className="text-amber-500 mb-4" />
                <p className="text-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {service.gallery && service.gallery.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl md:text-4xl font-thin tracking-tight mb-10">Наши объекты</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {service.gallery.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${service.menuTitle} — объект СК ВЫСОТА, фото ${i + 1}`}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
              ))}
            </div>
            <Link to="/#projects" className="inline-flex items-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground">
              Все проекты
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </section>
      )}

      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-thin tracking-tight mb-10">Частые вопросы</h2>
          <div className="space-y-4">
            {service.faq.map((f) => (
              <details key={f.q} className="group border border-border bg-white p-5">
                <summary className="cursor-pointer list-none flex justify-between gap-4 text-lg font-medium text-foreground">
                  {f.q}
                  <Icon name="Plus" size={20} className="shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="text-muted-foreground leading-relaxed mt-4">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LeadForm initialService={service.menuTitle} />

      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-thin tracking-tight mb-6">Другие услуги</h2>
          <div className="flex flex-wrap gap-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                to={`/uslugi/${s.slug}`}
                className="text-sm px-4 py-2 border border-border hover:bg-foreground hover:text-primary-foreground transition-colors"
              >
                {s.menuTitle}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
