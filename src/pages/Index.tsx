import { useSeo } from "@/hooks/useSeo"
import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { Philosophy } from "../components/Philosophy"
import { Projects } from "../components/Projects"
import { Expertise } from "../components/Expertise"
import { FAQ } from "../components/FAQ"
import { CallToAction } from "../components/CallToAction"
import { LeadForm } from "../components/LeadForm"
import { Footer } from "../components/Footer"

export default function Index() {
  useSeo({
    title: "СК ВЫСОТА — строительная компания в Москве и области | Металлоконструкции, ангары, фундаменты",
    description: "Строительная компания СК ВЫСОТА: общестроительные работы, производство и монтаж металлоконструкций, ангары и склады под ключ, фундаменты, кровля, фасады, резервуары РВС и РГС. 14 лет опыта, более 100 проектов. Бесплатный расчёт стоимости.",
  })
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Expertise />
      <Projects />
      <Philosophy />
      <FAQ />
      <LeadForm />
      <CallToAction />
      <Footer />
    </main>
  )
}