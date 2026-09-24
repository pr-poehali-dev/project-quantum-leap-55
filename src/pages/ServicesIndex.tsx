import { Link } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Icon from "@/components/ui/icon"
import { useSeo } from "@/hooks/useSeo"
import { services } from "@/data/services"

export default function ServicesIndex() {
  useSeo({
    title: "Услуги строительной компании СК ВЫСОТА в Москве и области",
    description:
      "Металлоконструкции, ангары и склады под ключ, резервуары РВС и РГС, фундаменты, монолитные работы, кровля, фасады, малоэтажное строительство. Бесплатный расчёт стоимости.",
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-foreground text-primary-foreground pt-40 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <nav className="text-sm text-primary-foreground/60 mb-8 flex items-center gap-2" aria-label="Навигация">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-primary-foreground/90">Услуги</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-thin leading-[1.1] tracking-tight mb-6">Услуги СК ВЫСОТА</h1>
          <p className="text-lg text-primary-foreground/75 max-w-3xl leading-relaxed">
            Общестроительные работы, производство и монтаж металлоконструкций, малоэтажное строительство под ключ. Свои бригады, собственное производство, работа по договору.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.slug}
              to={`/uslugi/${s.slug}`}
              className="group border border-border bg-white p-8 hover:border-foreground transition-colors flex flex-col"
            >
              <Icon name={s.icon} fallback="Building2" size={36} className="text-foreground mb-5" />
              <h2 className="text-xl font-medium text-foreground mb-3">{s.menuTitle}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">{s.intro}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm text-foreground">
                Подробнее
                <Icon name="ArrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}
