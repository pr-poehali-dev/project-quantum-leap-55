import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { LEAD_STATUSES, statusInfo } from "@/lib/leadStatus"
import { formatSize } from "@/components/lead/fileUpload"

export interface LeadDocument {
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

const MAX_DOC_SIZE = 3 * 1024 * 1024
const DOC_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.rar,.7z,.dwg,.dxf,.txt,.rtf"
const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp"

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

interface Props {
  apiUrl: string
  password: string
  leadId: number
  status: string
  documents: LeadDocument[]
  diskLink: string
  progressPhotos: ProgressPhoto[]
  hasAccount: boolean
  onChanged: () => void
}

export function LeadManage({ apiUrl, password, leadId, status, documents, diskLink, progressPhotos, hasAccount, onChanged }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [link, setLink] = useState(diskLink)
  const [caption, setCaption] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Password": password },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || "Ошибка")
    return data
  }

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError("")
    try {
      await fn()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setBusy(false)
    }
  }

  const upload = (file: File) =>
    run(async () => {
      if (file.size > MAX_DOC_SIZE) throw new Error("Файл больше 3 МБ")
      const data = await readAsDataUrl(file)
      await post({
        action: "upload_document",
        lead_id: leadId,
        filename: file.name,
        title: title.trim(),
        contentType: file.type || "application/octet-stream",
        data,
      })
      setTitle("")
    })

  const saveLink = () =>
    run(() => post({ action: "set_disk_link", lead_id: leadId, disk_link: link.trim() }))

  const uploadPhoto = (file: File) =>
    run(async () => {
      if (file.size > MAX_DOC_SIZE) throw new Error("Файл больше 3 МБ")
      const data = await readAsDataUrl(file)
      await post({
        action: "upload_progress_photo",
        lead_id: leadId,
        filename: file.name,
        caption: caption.trim(),
        contentType: file.type || "image/jpeg",
        data,
      })
      setCaption("")
    })

  const current = statusInfo(status)

  return (
    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500">Статус:</span>
        <select
          value={current.key}
          disabled={busy}
          onChange={(e) => run(() => post({ action: "set_status", lead_id: leadId, status: e.target.value }))}
          className={`text-xs font-medium px-2 py-1 border-0 outline-none cursor-pointer ${current.className}`}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s.key} value={s.key} className="bg-white text-neutral-900">
              {s.label}
            </option>
          ))}
        </select>
        {!hasAccount && (
          <span className="text-xs text-neutral-400">клиент без личного кабинета: статус и документы он не увидит</span>
        )}
      </div>

      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center gap-2 border border-neutral-200 bg-neutral-50 pl-2 pr-1 py-1 max-w-[300px]">
              <Icon name="FileText" size={14} className="text-neutral-500 shrink-0" />
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-800 hover:underline truncate">
                {d.title}
              </a>
              <span className="text-[11px] text-neutral-400 shrink-0">{formatSize(d.size)}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Убрать документ «${d.title}» из кабинета клиента?`)) {
                    run(() => post({ action: "hide_document", document_id: d.id }))
                  }
                }}
                className="p-1 text-neutral-400 hover:text-red-600 shrink-0"
                aria-label="Удалить документ"
              >
                <Icon name="X" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название документа (например, «Смета на ангар»)"
          className="flex-1 border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-neutral-900"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          <Icon name={busy ? "Loader2" : "Upload"} size={14} className={busy ? "animate-spin" : ""} />
          Загрузить документ клиенту
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={DOC_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ""
            if (f) upload(f)
          }}
        />
      </div>

      <div className="pt-3 border-t border-neutral-100 space-y-2">
        <p className="text-xs text-neutral-500 flex items-center gap-1.5">
          <Icon name="HardDrive" size={13} />
          Контроль проводимых работ
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ссылка на папку Яндекс.Диска с объектом"
            className="flex-1 border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-neutral-900"
          />
          <button
            type="button"
            disabled={busy || link.trim() === diskLink}
            onClick={saveLink}
            className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            <Icon name="Save" size={14} />
            Сохранить ссылку
          </button>
        </div>

        {progressPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {progressPhotos.map((p) => (
              <div key={p.id} className="relative group w-20 h-20">
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <img src={p.url} alt={p.caption} className="w-20 h-20 object-cover border border-neutral-200" />
                </a>
                {p.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">{p.caption}</span>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("Убрать фото из кабинета клиента?")) {
                      run(() => post({ action: "hide_progress_photo", photo_id: p.id }))
                    }
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Удалить фото"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Подпись к фото (например, «Заливка фундамента»)"
            className="flex-1 border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-neutral-900"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => photoRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            <Icon name={busy ? "Loader2" : "ImagePlus"} size={14} className={busy ? "animate-spin" : ""} />
            Добавить фото этапа
          </button>
          <input
            ref={photoRef}
            type="file"
            accept={PHOTO_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ""
              if (f) uploadPhoto(f)
            }}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default LeadManage