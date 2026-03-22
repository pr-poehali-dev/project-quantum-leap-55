import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./HighlightedText"

const philosophyItems = [
  {
    title: "Полный цикл под собственным контролем",
    description:
      "Проектирование, производство и монтаж выполняем своими силами. Вы работаете напрямую с одной командой на протяжении всего проекта — без посредников, без скрытых наценок и с полным контролем качества.",
  },
  {
    title: "Опыт, который говорит сам за себя",
    description:
      "За плечами десятки реализованных объектов: ангары для агрохолдингов, резервуары для нефтепродуктов, промышленные ограждения. Особая гордость — обширный положительный опыт в сфере малоэтажного строительства: коттеджи, таунхаусы и коммерческие здания «под ключ». С нами вы получаете надёжного партнёра, который берёт на себя все заботы от идеи до сдачи объекта. Мы знаем, как избежать ошибок, которые стоят дорого.",
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
    text: "Всё началось без офисов и громких названий. С обычных ремонтов квартир — своими руками, после основной работы, по выходным и ночам. Мы сами таскали мешки со смесями, сами клали плитку, сами собирали потолки и сдавали объекты заказчикам.\n\nПараллельно брались за то, что умели лучше всего — металл. Варили каркасы, делали небольшие металлоконструкции, помогали на стройках. Без команды, без техники — только инструмент, опыт и желание расти.",
  },
  {
    label: "Первые объекты",
    text: "Постепенно сложные задачи стали нашей специализацией. Металлоконструкции становились крупнее, проекты — серьёзнее. Мы сами искали заказчиков, сами считали сметы и сами отвечали за результат.\n\nКаждый объект был проверкой: выдержит ли наша работа время, нагрузку и ответственность.",
  },
  {
    label: "Первый серьёзный контракт",
    text: "Настоящим переломным моментом стал первый крупный контракт. Нас ещё мало кто знал, но заказчик поверил нашему слову. Мы доказали, что можем работать на уровне больших компаний — соблюдая сроки и выполняя работу без компромиссов по качеству.",
  },
  {
    label: "Сложные объекты",
    text: "Со временем мы вышли на монтаж резервуаров РВС и РГС — где важна не только сила рук, но и математическая точность. Каждый миллиметр имеет значение, каждая сварка проверяется временем.\n\nМы доказали: сложнейшие конструкции можно строить надёжно и в срок.",
  },
  {
    label: "Команда",
    text: "Со временем к нам начали приходить люди — настоящие специалисты. Не из-за громкого имени, а потому что видели: здесь держат слово и не бросают своих.\n\nТак сформировалась команда, которая работает вместе уже много лет.",
  },
  {
    label: "Сегодня",
    text: "Сегодня, спустя 6 лет, СК ВЫСОТА — это компания, которой доверяют сложные проекты.\n\nОт ремонтов квартир и первых металлоконструкций, сделанных своими руками, до строительства сложных резервуаров и промышленных объектов.\n\nМы не строили репутацию рекламой. Мы строили её работой, сталью и ответственностью.\n\nИ именно поэтому наши конструкции служат десятилетиями.",
  },
]

export function Philosophy() {
  const [activeTab, setActiveTab] = useState<"about" | "history">("about")
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setVisibleItems([])
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = Number(entry.target.getAttribute("data-index"))
            if (entry.isIntersecting) {
              setVisibleItems((prev) => [...new Set([...prev, index])])
            }
          })
        },
        { threshold: 0.15 },
      )
      itemRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
      return () => observer.disconnect()
    }, 100)
    return () => clearTimeout(timeout)
  }, [activeTab])

  return (
    <section id="about" className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Левая колонка */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">О компании</p>
            <h2 className="leading-[1.15] tracking-tight mb-8 text-balance text-center font-thin text-5xl">Создаём будущее, которому можно доверять</h2>

            {/* Табы */}
            <div className="flex gap-1 mb-8 border-b border-border">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === "about"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >Наши приоритеты</button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === "history"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                История компании
              </button>
            </div>

            <div className="relative hidden lg:block">
              <img
                src="https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/ae958d8b-58c2-48f7-adfd-16e447389c1a.jpg"
                alt="Производство металлоконструкций"
                className="opacity-90 relative z-10 w-auto"
              />
            </div>
          </div>

          {/* Правая колонка */}
          <div className="lg:pt-48">

            {activeTab === "about" && (
              <div className="space-y-6">
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-12">СК ВЫСОТА — это строительная компания с собственными производственными мощностями и опытными бригадами монтажников. Мы реализуем проекты любой сложности с гарантией результата.</p>
                {philosophyItems.map((item, index) => (
                  <div
                    key={item.title}
                    ref={(el) => { itemRefs.current[index] = el }}
                    data-index={index}
                    className={`transition-all duration-700 ${
                      visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex gap-6">
                      <span className="text-muted-foreground/50 text-sm font-medium">0{index + 1}</span>
                      <div>
                        <h3 className="text-xl font-medium mb-3 text-lime-600">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <p className="text-muted-foreground text-lg leading-relaxed mb-12">2020 год - время, когда мир замер, а стройки встали. У нас не было жирных контрактов и инвестиций. Был хаос — и мы увидели в нём возможность.</p>

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-[5px]" />
                  <div className="space-y-10">
                    {historyMilestones.map((milestone, index) => (
                      <div
                        key={index}
                        ref={(el) => { itemRefs.current[index] = el }}
                        data-index={index}
                        className={`pl-10 relative transition-all duration-700 ${
                          visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                        style={{ transitionDelay: `${index * 120}ms` }}
                      >
                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-foreground" />
                        <p className="text-xs tracking-[0.25em] uppercase mb-2 font-medium text-muted-foreground">{milestone.label}</p>
                        <div className="text-foreground/80 leading-relaxed space-y-3">
                          {milestone.text.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <blockquote className="mt-12 pt-10 border-t border-border">
                  <p className="text-xl font-medium leading-snug">С уважением,</p>
                  <footer className="mt-2 text-sm tracking-wide uppercase text-muted-foreground">Основатели СК Высота</footer>
                </blockquote>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}