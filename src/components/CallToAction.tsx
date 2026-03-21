import { ArrowRight } from "lucide-react"
import { HighlightedText } from "./HighlightedText"

export function CallToAction() {
  return (
    <section id="contact" className="py-32 md:py-29 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8">Получить расчёт</p>

          <h2 className="md:text-4xl lg:text-6xl leading-[1.1] tracking-tight mb-8 text-balance text-6xl font-thin">
            Готовы построить
            <br />
            что-то <HighlightedText>надёжное</HighlightedText>?
          </h2>

          <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Расскажите нам о вашем проекте — ангар, резервуар или забор. Наш инженер подготовит расчёт в течение 1–2 рабочих дней бесплатно.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@sk-vysota.ru"
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
          </div>

          <div className="mt-16 pt-16 border-t border-primary-foreground/10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-medium text-primary-foreground mb-2">50+</p>
              <p className="text-primary-foreground/60 text-sm">реализованных объектов</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-primary-foreground mb-2">10 лет</p>
              <p className="text-primary-foreground/60 text-sm">опыта в металлоконструкциях</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-primary-foreground mb-2">100%</p>
              <p className="text-primary-foreground/60 text-sm">собственное производство</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}