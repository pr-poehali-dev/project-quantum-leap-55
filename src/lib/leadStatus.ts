export const LEAD_STATUSES = [
  { key: "new", label: "Новая", className: "bg-sky-100 text-sky-800" },
  { key: "estimate", label: "Смета готова", className: "bg-amber-100 text-amber-800" },
  { key: "contract", label: "Договор", className: "bg-violet-100 text-violet-800" },
  { key: "in_progress", label: "В работе", className: "bg-orange-100 text-orange-800" },
  { key: "done", label: "Завершена", className: "bg-green-100 text-green-800" },
  { key: "cancelled", label: "Отменена", className: "bg-neutral-200 text-neutral-600" },
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]["key"]

export function statusInfo(key: string) {
  return LEAD_STATUSES.find((s) => s.key === key) || LEAD_STATUSES[0]
}
