import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./HighlightedText"
import Icon from "@/components/ui/icon"

const expertiseAreas = [
  {
    title: "Ангары",
    description:
      "Проектируем и монтируем ангары любого типа и назначения: для хранения зерна и техники в агрохолдингах, складские комплексы для бизнеса, производственные помещения. Любые размеры и конфигурации.",
    icon: "Warehouse",
  },
  {
    title: "Резервуары РВС и РГС",
    description:
      "Производство и монтаж вертикальных и горизонтальных стальных резервуаров с системами подогрева, забора и подачи. Для битума, нефтепродуктов, воды, кислот, удобрений и других жидкостей.",
    icon: "Cylinder",
  },
  {
    title: "Стальные заборы",
    description:
      "Изготовление и установка заборов из профлиста и трубы различных типов. Подходит для промышленных предприятий, агрохозяйств и частных территорий. Долговечно, надёжно, эстетично.",
    icon: "LayoutGrid",
  },
  {
    title: "Под ключ",
    description:
      "Все этапы — проектирование, производство, доставка и монтаж — выполняем самостоятельно. Вы получаете готовый объект без лишних согласований и посредников.",
    icon: "KeyRound",
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
      { threshold: 0.2 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" ref={sectionRef} className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-20">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Наши услуги</p>
          <h2 className="text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-8xl">
            <HighlightedText>Производство</HighlightedText> и монтаж
            <br />
            металлоконструкций
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Работаем с промышленными предприятиями, агрохолдингами и частными заказчиками. Гарантируем качество на каждом этапе.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
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
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`transition-all duration-1000 ${
                    visibleItems.includes(index) ? "animate-draw-stroke" : ""
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  <Icon name={area.icon} className="w-10 h-10 mb-4 text-foreground" strokeWidth={1.25} />
                </div>
                <h3 className="text-xl font-medium mb-4">{area.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{area.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
