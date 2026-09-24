import { useState } from "react"
import Icon from "@/components/ui/icon"
import { statusInfo, LEAD_STATUSES } from "@/lib/leadStatus"
import { formatSize } from "@/components/lead/fileUpload"

export interface CabinetDocument {
  id: number
  name: string
  title: string
  url: string
  size: number
  created_at: string
}

export interface ProgressPhoto {
  id: number
  url: string
  caption: string
  created_at: string
}

export interface CabinetLead {
  id: number
  source: string
  description: string
  region: string
  files: { name: string; url: string }[]
  links: string[]
  status: string
  created_at: string
  documents: CabinetDocument[]
  disk_link: string
  progress_photos: ProgressPhoto[]
}

function isImage(name: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(name)
}

export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  })
}

const STEPS = LEAD_STATUSES.filter((s) => s.key !== "cancelled")

function StatusSteps({ status }: { status: string }) {
  if (status === "cancelled") return null
  const idx = STEPS.findIndex((s) => s.key === status)
  return (
    <div className="flex items-center gap-1 mt-4">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex-1">
          <div className={`h-1.5 ${i <= idx ? "bg-green-600" : "bg-neutral-200"}`} />
          <p className={`hidden sm:block text-[11px] mt-1.5 ${i === idx ? "text-neutral-900 font-medium" : "text-neutral-400"}`}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export function CabinetDocuments({ leads }: { leads: CabinetLead[] }) {
  const [order, setOrder] = useState<"desc" | "asc">("desc")
  const docs = leads
    .flatMap((l) => l.documents.map((d) => ({ ...d, leadId: l.id })))
    .sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return order === "asc" ? diff : -diff
    })
  if (docs.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 py-14 px-6 text-center text-neutral-500">
        <Icon name="FolderOpen" size={36} className="mx-auto mb-3 text-neutral-300" />
        Здесь появятся сметы, договоры и отчёты по Вашим объектам
      </div>
    )
  }
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
        >
          <Icon name={order === "desc" ? "ArrowDownWideNarrow" : "ArrowUpNarrowWide"} size={14} />
          {order === "desc" ? "Сначала новые" : "Сначала старые"}
        </button>
      </div>
      <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
        {docs.map((d) => (
        <a
          key={d.id}
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors group"
        >
          {isImage(d.name) ? (
            <img src={d.url} alt="" className="w-10 h-10 object-cover shrink-0" />
          ) : (
            <span className="w-10 h-10 bg-green-50 text-green-700 flex items-center justify-center shrink-0">
              <Icon name="FileText" size={18} />
            </span>
          )}
          <span className="flex-1 min-w-0">
            <span className="block text-sm text-neutral-900 truncate">{d.title}</span>
            <span className="block text-xs text-neutral-500">
              Заявка №{d.leadId} · {formatDate(d.created_at)} · {formatSize(d.size)}
            </span>
          </span>
          <Icon name="Download" size={18} className="text-neutral-400 group-hover:text-green-700 shrink-0" />
        </a>
        ))}
      </div>
    </div>
  )
}

export function CabinetProgress({ leads }: { leads: CabinetLead[] }) {
  const active = leads.filter((l) => l.disk_link || l.progress_photos.length > 0)
  if (active.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 py-14 px-6 text-center text-neutral-500">
        <Icon name="HardDrive" size={36} className="mx-auto mb-3 text-neutral-300" />
        Здесь появятся ссылка на Яндекс.Диск и фотографии этапов работ по Вашему объекту
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {active.map((l) => (
        <div key={l.id} className="bg-white border border-neutral-200 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-sm font-medium text-neutral-900">Заявка №{l.id}</span>
            {l.disk_link && (
              <a
                href={l.disk_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs bg-neutral-900 text-white px-3 py-1.5 hover:bg-neutral-700 transition-colors"
              >
                <Icon name="HardDrive" size={14} />
                Открыть папку на Яндекс.Диске
              </a>
            )}
          </div>
          {l.progress_photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {l.progress_photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="relative block group">
                  <img src={p.url} alt={p.caption} className="w-full aspect-square object-cover border border-neutral-200" />
                  {p.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[11px] px-2 py-1 truncate">{p.caption}</span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Фотографии этапов пока не добавлены</p>
          )}
        </div>
      ))}
    </div>
  )
}

export function CabinetLeads({ leads, onNewLead }: { leads: CabinetLead[]; onNewLead: () => void }) {
  if (leads.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 py-14 px-6 text-center">
        <Icon name="ClipboardList" size={36} className="mx-auto mb-3 text-neutral-300" />
        <p className="text-neutral-600 mb-5">У Вас пока нет заявок. Оставьте заявку, и здесь появится её статус.</p>
        <button onClick={onNewLead} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm">
          Оставить заявку на расчёт
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((l) => {
        const st = statusInfo(l.status)
        return (
          <div key={l.id} className="bg-white border border-neutral-200 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-medium text-neutral-900">Заявка №{l.id}</span>
              <span className={`text-xs px-2 py-0.5 font-medium ${st.className}`}>{st.label}</span>
              <span className="text-xs text-neutral-500">от {formatDate(l.created_at)}</span>
              {l.source === "callback" && <span className="text-xs text-neutral-500">· обратный звонок</span>}
            </div>
            {l.region && <p className="text-xs text-neutral-500 mb-1">Регион: {l.region}</p>}
            {l.description && <p className="text-sm text-neutral-700 whitespace-pre-wrap line-clamp-4">{l.description}</p>}
            {l.files.length > 0 && (
              <p className="text-xs text-neutral-500 mt-2">Приложено файлов: {l.files.length}</p>
            )}
            <StatusSteps status={l.status} />
            {l.documents.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {l.documents.map((d) =>
                  isImage(d.name) ? (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 border border-neutral-200 hover:border-green-600 px-2 py-1.5 max-w-[220px] transition-colors"
                    >
                      <img src={d.url} alt="" className="w-8 h-8 object-cover shrink-0" />
                      <span className="text-xs text-neutral-700 group-hover:text-green-800 truncate">{d.title}</span>
                    </a>
                  ) : (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs border border-green-600/40 text-green-800 px-3 py-1.5 hover:bg-green-600 hover:text-white transition-colors"
                    >
                      <Icon name="FileDown" size={14} />
                      {d.title}
                    </a>
                  )
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CabinetLeads