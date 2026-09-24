import { services } from "@/data/services"

export function Footer() {
  return (
    <footer className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <a href="/" className="inline-block mb-6">
              <img
                src="https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/44f689af-75b7-4fd8-b1b9-6d1422739045.jpg"
                alt="СК Высота"
                className="h-14 w-auto object-contain"
              />
            </a>
            <p className="text-muted-foreground leading-relaxed max-w-sm"></p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Компания</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/#projects" className="hover:text-foreground transition-colors">
                  Проекты
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-foreground transition-colors">
                  О компании
                </a>
              </li>
              <li>
                <a href="/uslugi" className="hover:text-foreground transition-colors">
                  Услуги
                </a>
              </li>
              <li>
                <a href="/contacts" className="hover:text-foreground transition-colors">
                  Контакты
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Услуги</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {services.map((s) => (
                <li key={s.slug}>
                  <a href={`/uslugi/${s.slug}`} className="hover:text-foreground transition-colors">
                    {s.menuTitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Связь</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:skvisotapro@mail.ru" className="hover:text-foreground transition-colors">skvisotapro@mail.ru</a>
              </li>
              <li>
                <a href="tel:+79091530033" className="hover:text-foreground transition-colors">+7 909 153-00-33</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 СК ВЫСОТА. Все права защищены.</p>
          <a href="/privacy" className="hover:text-foreground transition-colors">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  )
}