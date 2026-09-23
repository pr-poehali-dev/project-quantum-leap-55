import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { ACCEPT, MAX_FILES, formatSize, uploadFile } from "./fileUpload"

export interface AttachedFile {
  id: string
  name: string
  size: number
  preview?: string
  status: "uploading" | "done" | "error"
  url?: string
  error?: string
}

interface Props {
  files: AttachedFile[]
  onChange: (updater: (prev: AttachedFile[]) => AttachedFile[]) => void
}

export function FileAttachments({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const free = MAX_FILES - files.length
    const selected = Array.from(list).slice(0, Math.max(0, free))
    selected.forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
      onChange((prev) => [...prev, { id, name: file.name, size: file.size, preview, status: "uploading" }])
      uploadFile(file)
        .then(({ url }) => onChange((prev) => prev.map((f) => (f.id === id ? { ...f, status: "done", url } : f))))
        .catch((err: Error) =>
          onChange((prev) => prev.map((f) => (f.id === id ? { ...f, status: "error", error: err.message } : f))),
        )
    })
  }

  const remove = (id: string) => {
    onChange((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target?.preview) URL.revokeObjectURL(target.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  return (
    <div>
      <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
        Фото и файлы <span className="normal-case tracking-normal">(необязательно)</span>
      </label>

      {files.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            addFiles(e.dataTransfer.files)
          }}
          className={`w-full border border-dashed px-4 py-6 flex flex-col items-center gap-2 text-center transition-colors ${
            dragOver ? "border-foreground bg-secondary" : "border-border hover:border-foreground/50 bg-white"
          }`}
        >
          <Icon name="Paperclip" size={22} className="text-muted-foreground" />
          <span className="text-sm text-foreground">Прикрепите фото объекта, чертежи или смету</span>
          <span className="text-xs text-muted-foreground">
            До {MAX_FILES} файлов · фото, PDF, Word, Excel, DWG, архивы
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ""
        }}
      />

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 border border-border bg-white px-3 py-2">
              <div className="w-10 h-10 shrink-0 bg-secondary flex items-center justify-center overflow-hidden">
                {f.preview ? (
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="FileText" size={18} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{f.name}</p>
                <p className={`text-xs ${f.status === "error" ? "text-red-600" : "text-muted-foreground"}`}>
                  {f.status === "uploading" && "Загружается..."}
                  {f.status === "done" && formatSize(f.size)}
                  {f.status === "error" && f.error}
                </p>
              </div>
              {f.status === "uploading" && <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />}
              {f.status === "done" && <Icon name="Check" size={16} className="text-green-600" />}
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Удалить файл"
              >
                <Icon name="X" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileAttachments
