import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./HighlightedText"

const philosophyItems = [
  {
    title: "Полный цикл под собственным контролем",
    description:
      "Проектирование, производство, монтаж — всё выполняем своими силами. Никаких субподрядчиков и непредвиденных накруток. Вы работаете с одной командой от начала до конца.",
  },
  {
    title: "Опыт, который говорит сам за себя",
    description:
      "За плечами десятки реализованных объектов: ангары для агрохолдингов, резервуары для нефтепродуктов, промышленные ограждения. Мы знаем, как избежать ошибок, которые стоят дорого.",
  },
  {
    title: "Оптимизация без потери качества",
    description:
      "Умеем находить инженерные решения, которые экономят бюджет заказчика без ущерба для надёжности. Не закладываем лишних узлов — только то, что действительно нужно вашему объекту.",
  },
  {
    title: "Строгий контроль на каждом этапе",
    description:
      "Производство и монтаж ведётся под постоянным надзором наших инженеров. Соответствие нормам и срокам — не обещание, а рабочий стандарт.",
  },
]

export function Philosophy() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
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
      { threshold: 0.3 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">О компании</p>
            <h2 className="text-6xl md:text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-8xl">
              Строим с
              <br />
              <HighlightedText>умом</HighlightedText>
            </h2>

            <div className="relative hidden lg:block">
              <img
                src="/images/exterior.png"
                alt="Производство металлоконструкций"
                className="opacity-90 relative z-10 w-auto"
              />
            </div>
          </div>

          <div className="space-y-6 lg:pt-48">
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-12">
              СК ВЫСОТА — это производственная компания с собственными мощностями и опытной бригадой монтажников. Мы берёмся за проекты любой сложности и доводим их до результата.
            </p>

            {philosophyItems.map((item, index) => (
              <div
                key={item.title}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                data-index={index}
                className={`transition-all duration-700 ${
                  visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <span className="text-muted-foreground/50 text-sm font-medium">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
