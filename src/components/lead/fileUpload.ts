export const UPLOAD_URL = "https://functions.poehali.dev/ce35517b-c0fc-428c-a491-1b21e20dfb85"

export const MAX_FILES = 10
export const MAX_FILE_SIZE = 2.5 * 1024 * 1024
export const ACCEPT =
  ".jpg,.jpeg,.png,.webp,.heic,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.dwg,.dxf,.zip,.rar,.7z"

const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp"]

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function compressImage(file: File): Promise<{ blob: Blob; name: string; type: string }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    const maxSide = 1920
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) return { blob: file, name: file.name, type: file.type }
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82))
    if (!blob || blob.size >= file.size) return { blob: file, name: file.name, type: file.type }
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return { blob, name, type: "image/jpeg" }
  } catch {
    return { blob: file, name: file.name, type: file.type }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function uploadFile(file: File): Promise<{ url: string; name: string }> {
  let blob: Blob = file
  let name = file.name
  let type = file.type || "application/octet-stream"

  if (COMPRESSIBLE.includes(file.type)) {
    const compressed = await compressImage(file)
    blob = compressed.blob
    name = compressed.name
    type = compressed.type
  }

  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("Файл больше 2,5 МБ")
  }

  const data = await readAsDataUrl(blob)
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: name, contentType: type, data }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || "Не удалось загрузить файл")
  return { url: json.url, name: json.name || name }
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} МБ`
}
