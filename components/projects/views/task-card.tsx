"use client"

import { ArrowDown, ArrowUp, Minus, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Priority = "low" | "medium" | "high" | "urgent"

interface User {
  name?: string
  surname?: string
  email?: string
}

interface TaskCardProps {
  title: string
  description?: string
  priority: Priority
  assignee?: User | null
  dragging?: boolean
  onEdit?: () => void
}

const PRIORITY_META: Record<Priority, { label: string; icon: React.ReactNode; className: string }> = {
  urgent: { label: "Krytyczny", icon: <ArrowUp   className="size-3" />, className: "text-red-500" },
  high:   { label: "Wysoki",    icon: <ArrowUp   className="size-3" />, className: "text-orange-500" },
  medium: { label: "Średni",    icon: <Minus     className="size-3" />, className: "text-amber-500" },
  low:    { label: "Niski",     icon: <ArrowDown className="size-3" />, className: "text-slate-400" },
}

function initialsOf(user: User) {
  const a = user.name?.[0] ?? ""
  const b = user.surname?.[0] ?? ""
  const out = (a + b).toUpperCase()
  return out || user.email?.[0]?.toUpperCase() || "?"
}

export function TaskCard({ title, description, priority, assignee, dragging, onEdit }: TaskCardProps) {
  const p = PRIORITY_META[priority]
  return (
    <div
      className={`group flex flex-col gap-2 rounded-lg border border-border/60 bg-background p-3 shadow-sm transition-colors ${
        dragging ? "opacity-50" : "hover:border-border hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-medium text-foreground">{title}</p>
        {onEdit && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
            aria-label="Edytuj zadanie"
          >
            <Pencil className="size-3" />
          </button>
        )}
      </div>
      {description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className={`h-5 gap-1 rounded-full px-1.5 text-[10px] ${p.className}`}>
          {p.icon}
          {p.label}
        </Badge>
        {assignee ? (
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[9px] font-bold text-white"
            title={`${assignee.name ?? ""} ${assignee.surname ?? ""}`.trim()}
          >
            {initialsOf(assignee)}
          </div>
        ) : (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-[9px] text-muted-foreground">
            —
          </div>
        )}
      </div>
    </div>
  )
}
