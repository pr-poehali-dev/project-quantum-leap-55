import Icon from "@/components/ui/icon"

const reasons = [
  {
    icon: "HardHat",
    title: "Свои бригады",
    description: "Работаем только с собственными проверенными бригадами — без субподрядчиков и посредников.",
  },
  {
    icon: "Factory",
    title: "Собственное производство",
    description: "Производим металлоконструкции на своей базе, что сокращает сроки и снижает стоимость.",
  },
  {
    icon: "FileText",
    title: "Работаем по договору",
    description: "Все условия, сроки и стоимость фиксируются в договоре — никаких устных договорённостей.",
  },
  {
    icon: "ClipboardCheck",
    title: "Контроль каждого этапа",
    description: "Прораб и технадзор следят за качеством на каждом этапе строительства.",
  },
  {
    icon: "ShieldCheck",
    title: "Гарантия",
    description: "Предоставляем официальную гарантию на все выполненные работы и конструкции.",
  },
]

export function WhyTrust() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-14">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Наши преимущества</p>
          <h2 className="text-4xl font-light tracking-tight text-foreground">Почему нам доверяют</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((item) => (
            <div key={item.title} className="border border-border p-8 flex flex-col gap-4 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 flex items-center justify-center">
                <Icon name={item.icon} size={24} className="text-accent" />
              </div>
              <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
