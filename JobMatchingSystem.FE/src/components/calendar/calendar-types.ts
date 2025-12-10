export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  description?: string
}

export interface CalendarEventInput {
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  description?: string
}

export const eventColors = [
  { label: "Xanh dương", value: "#3b82f6" },
  { label: "Xanh lá", value: "#22c55e" },
  { label: "Vàng", value: "#f59e0b" },
  { label: "Đỏ", value: "#ef4444" },
  { label: "Tím", value: "#8b5cf6" },
  { label: "Hồng", value: "#ec4899" },
  { label: "Cam", value: "#f97316" },
  { label: "Cyan", value: "#06b6d4" },
] as const

