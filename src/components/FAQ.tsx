import { useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "Сколько в среднем стоит строительство «под ключ» и можно ли уложиться в фиксированный бюджет?",
    answer:
      "Стоимость формируется из четырёх блоков: проектирование, материалы, трудозатраты и техника. После разработки рабочего проекта мы составляем смету с точностью до позиций и фиксируем её в договоре. Цена меняется только при согласованном заказчиком изменении объёма или класса материалов; никаких «сюрпризов» по ходу работ не будет.",
  },
  {
    question: "Сколько времени занимает изготовление и монтаж?",
    answer:
      "Сроки зависят от типа и размера объекта. Типовой ангар — от 4 до 8 недель с момента подписания договора. Резервуары РВС и РГС — от 6 до 12 недель. Точные сроки фиксируем в договоре и строго соблюдаем.",
  },
  {
    question: "Вы делаете резервуары для хранения битума и нефтепродуктов?",
    answer:
      "Да, это одно из наших ключевых направлений. Производим резервуары с системами разогрева, забора и подачи для битума, мазута, масел, кислот, удобрений и воды. Проектируем под конкретные требования к температуре и давлению.",
  },
  {
    question: "Вы работаете с субподрядчиками?",
    answer:
      "Нет. Все этапы — от проектирования и производства до монтажа — выполняем собственными силами. Это гарантирует единый стандарт качества и позволяет нам отвечать за результат.",
  },
  {
    question: "Можно ли заказать забор для частного участка?",
    answer:
      "Да, мы устанавливаем стальные заборы из профлиста и трубы как для промышленных и коммерческих объектов, так и для частных территорий. Предложим оптимальное решение под ваш бюджет и задачи.",
  },
  {
    question: "Как получить расчёт стоимости?",
    answer:
      "Оставьте заявку через форму на сайте или позвоните нам. Наш инженер свяжется с вами, уточнит параметры объекта и подготовит предварительный расчёт в течение 1–2 рабочих дней — бесплатно и без обязательств.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Вопросы</p>
          <h2 className="text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-7xl">
            Частые вопросы
          </h2>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-foreground/70">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-muted-foreground leading-relaxed pb-6 pr-12">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}