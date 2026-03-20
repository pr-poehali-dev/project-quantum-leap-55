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

const historyMilestones = [
  {
    label: "Начало",
    text: "Ржавый арендованный ангар, первый подержанный сварочный аппарат и двое друзей с общей мечтой. Мы сами грузили металл, сами стояли у станков, сами выезжали на объекты — когда другие прятались по домам.",
  },
  {
    label: "Первый тендер",
    text: "Нас не знали, но поверили нашему слову. Выигранный тендер — первый кирпичик в фундаменте репутации. Нам нечем было «пиарить» себя, кроме одного — качества шва и соблюдения сроков.",
  },
  {
    label: "Сложные объекты",
    text: "Монтаж РВС и РГС, где математическая точность важнее амбиций. Мы доказали: можно строить сложнейшие резервуары без ошибок и в срок.",
  },
  {
    label: "Команда",
    text: "Профессионалы приходили к нам потому, что видели: здесь не бросают своих. Так сложилась команда, которая остаётся с нами по сей день.",
  },
  {
    label: "Сегодня",
    text: "6 лет спустя СК ВЫСОТА — символ надёжности для наших заказчиков. От сварки в гараже до строительства сложнейших резервуаров. Репутация дороже мгновенной выгоды — мы заработали её сталью, которая служит десятилетиями.",
  },
]

export function Philosophy() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [visibleMilestones, setVisibleMilestones] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          const type = entry.target.getAttribute("data-type")
          if (entry.isIntersecting) {
            if (type === "milestone") {
              setVisibleMilestones((prev) => [...new Set([...prev, index])])
            } else {
              setVisibleItems((prev) => [...new Set([...prev, index])])
            }
          }
        })
      },
      { threshold: 0.2 },
    )

    itemRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    milestoneRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })

    return () => observer.disconnect()
  }, [])

  return (
    <>
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
                  ref={(el) => { itemRefs.current[index] = el }}
                  data-index={index}
                  data-type="item"
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

      {/* История компании */}
      <section className="py-32 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-20">
            <p className="text-primary-foreground/50 text-sm tracking-[0.3em] uppercase mb-6">История компании</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight mb-6">
              2020 — год,<br />когда всё <HighlightedText>началось</HighlightedText>
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed">
              Время, когда мир замер, а стройки встали. У нас не было жирных контрактов, офисов с фикусами и инвестиций. Был хаос — и мы увидели в нём возможность.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-primary-foreground/10 ml-[5px] hidden md:block" />

            <div className="space-y-12">
              {historyMilestones.map((milestone, index) => (
                <div
                  key={index}
                  ref={(el) => { milestoneRefs.current[index] = el }}
                  data-index={index}
                  data-type="milestone"
                  className={`md:pl-12 relative transition-all duration-700 ${
                    visibleMilestones.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-orange-300 hidden md:block" />
                  <p className="text-orange-300 text-xs tracking-[0.25em] uppercase mb-2 font-medium">{milestone.label}</p>
                  <p className="text-primary-foreground/80 leading-relaxed max-w-2xl">{milestone.text}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="mt-20 pt-12 border-t border-primary-foreground/10 max-w-2xl">
            <p className="text-2xl md:text-3xl font-medium leading-snug text-primary-foreground/90">
              «Мы заработали авторитет не громкими лозунгами, а сталью, которая служит десятилетиями.»
            </p>
            <footer className="mt-6 text-primary-foreground/40 text-sm tracking-wide uppercase">Основатели СК ВЫСОТА</footer>
          </blockquote>
        </div>
      </section>
    </>
  )
}
