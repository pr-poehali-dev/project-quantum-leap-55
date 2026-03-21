import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./HighlightedText"
import Icon from "@/components/ui/icon"

const expertiseAreas = [
  {
    title: "Монтаж сборных железобетонных конструкций",
    description: "Панели, плиты, балки, колонны, пространственные блок-модули.",
    icon: "Layers",
  },
  {
    title: "Металлоконструкции",
    description: "Изготовление и монтаж каркасов ангаров, промышленных и коммерческих зданий. Сварка, антикоррозийная защита, огнезащитная обработка.",
    icon: "Wrench",
  },
  {
    title: "Земляные работы",
    description: "Разработка котлованов и траншей, устройство насыпей, планировка площадок.",
    icon: "Shovel",
  },
  {
    title: "Фундаменты и подземные конструкции",
    description: "Свайные, ленточные, плитные и ростверковые фундаменты. Гидро- и теплоизоляция подземных частей, подвальные и цокольные стены, подпорные стены.",
    icon: "Building2",
  },
  {
    title: "Монолитные железобетонные работы",
    description: "Каркасы, плиты перекрытий, колонны, ригели, лестничные марши, шахты лифтов. Несъёмная и классическая опалубка, уплотнение грунта.",
    icon: "HardHat",
  },
  {
    title: "Кровельные работы",
    description: "Плоские и скатные крыши: рулонные, мембранные, черепичные, фальцевые, мягкие. Утепление, паро- и гидроизоляция, водоотвод.",
    icon: "Home",
  },
  {
    title: "Фасадные работы",
    description: "Мокрые и вентилируемые фасады, утепление, облицовка камнем, керамикой, композитом, кассетами. Витражные системы, окна и двери.",
    icon: "PanelTop",
  },
  {
    title: "Тепло-, гидро-, звуко- и пароизоляция",
    description: "Наружные ограждающие конструкции, крыши, перекрытия и перегородки.",
    icon: "Shield",
  },
  {
    title: "Черновые и чистовые отделочные работы",
    description: "Стяжки полов, штукатурка, шпаклёвка, шлифовка. Оклейка обоями, окраска, укладка плитки, паркета, ламината. Подвесные и натяжные потолки.",
    icon: "PaintRoller",
  },
  {
    title: "Внутренние перегородки и стены",
    description: "Гипсокартон, ГВЛ, СМЛ, металлокассеты, ПГП.",
    icon: "LayoutGrid",
  },
  {
    title: "Благоустройство и озеленение",
    description: "Тротуары, дороги, бордюры, подпорные стены. Газоны, клумбы, малые архитектурные формы, дренаж.",
    icon: "Trees",
  },
  {
    title: "Инженерные системы",
    description: "Электроснабжение, внутреннее и наружное водоснабжение, канализация, отопление, пожарная безопасность.",
    icon: "Zap",
  },
]

export function Expertise() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.1 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" ref={sectionRef} className="py-32 md:py-29 relative" style={{ backgroundImage: "url('https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/c738f54c-3177-4845-83d9-29721f99cc42.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-20">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Наши услуги</p>
          <h2 className="leading-[1.15] tracking-tight mb-6 text-balance text-center font-thin text-6xl">
            Строительство и монтаж
            <br />
            под ключ
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Работаем с промышленными предприятиями, агрохолдингами и частными заказчиками. Гарантируем качество на каждом этапе.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {expertiseAreas.map((area, index) => {
            return (
              <div
                key={area.title}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                data-index={index}
                className={`relative pl-8 border-l border-border transition-all duration-700 ${
                  visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${(index % 3) * 150}ms` }}
              >
                <div className={`transition-all duration-1000 ${visibleItems.includes(index) ? "animate-draw-stroke" : ""}`}>
                  <Icon name={area.icon} className="w-10 h-10 mb-4 text-foreground" strokeWidth={1.25} />
                </div>
                <h3 className="text-xl font-medium mb-4">{area.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{area.description}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-foreground/20 hover:bg-foreground hover:text-white transition-all duration-300"
                >
                  Получить услугу
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}