import { useState, useEffect, useRef } from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "РВС-3500 с системой разогрева и подачи",
    category: "Резервуар вертикальный стальной",
    location: "Производственный объект",
    year: "2024",
    images: [
      "https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/4c65f0aa-4fe8-4439-9454-bf00f983b4e4.jpg",
      "https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/f4d67a63-531c-480b-92dc-1526e55cb510.jpg",
      "https://cdn.poehali.dev/projects/ab828921-d5cd-4f26-97d6-4aa4f4adee06/bucket/f0102154-fb5e-4296-9273-c06b616f6aba.jpg",
    ],
  },
  {
    id: 2,
    title: "РГС для битума с подогревом",
    category: "Резервуар горизонтальный стальной",
    location: "Дорожно-строительная компания",
    year: "2023",
    images: ["/images/hously-4.png"],
  },
]

function ProjectCard({ project, index, isRevealed }: { project: typeof projects[0]; index: number; isRevealed: boolean }) {
  const [currentImage, setCurrentImage] = useState(0)
  const hasMultiple = project.images.length > 1

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImage((i) => (i - 1 + project.images.length) % project.images.length)
  }

  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImage((i) => (i + 1) % project.images.length)
  }

  return (
    <article className="group cursor-pointer">
      <div className="relative overflow-hidden aspect-[4/3] mb-6">
        <img
          src={project.images[currentImage]}
          alt={project.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-primary origin-top"
          style={{
            transform: isRevealed ? "scaleY(0)" : "scaleY(1)",
            transition: "transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)",
          }}
        />

        {hasMultiple && isRevealed && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {project.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImage(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === currentImage ? "bg-white w-4" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">{project.title}</h3>
          <p className="text-muted-foreground text-sm">
            {project.category} · {project.location}
          </p>
        </div>
        <span className="text-muted-foreground/60 text-sm">{project.year}</span>
      </div>
    </article>
  )
}

export function Projects() {
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set())
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setRevealedIds((prev) => new Set(prev).add(projects[index].id))
            }
          }
        })
      },
      { threshold: 0.2 },
    )

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" className="py-32 md:py-29 bg-secondary/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Наши объекты</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">Реализованные проекты</h2>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            Обсудить ваш проект
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <div key={project.id} ref={(el) => (imageRefs.current[index] = el)}>
              <ProjectCard
                project={project}
                index={index}
                isRevealed={revealedIds.has(project.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
