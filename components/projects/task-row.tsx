"use client"

import { ArrowDown, ArrowUp, CheckCircle2, Circle, CircleDot, Minus, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"

interface User {
  name?: string
  surname?: string
  email?: string
  image?: string | null
}

interface Task {
  _id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  board: { name: string } | null
  assignee: User | null
}

const STATUS_META: Record<Status, { label: string; icon: React.ReactNode }> = {
  todo:       { label: "Do zrobienia", icon: <Circle       className="size-3 text-slate-400" /> },
  inprogress: { label: "W toku",       icon: <CircleDot    className="size-3 text-sky-500" /> },
  review:     { label: "Do przeglądu", icon: <CircleDot    className="size-3 text-amber-500" /> },
  done:       { label: "Gotowe",       icon: <CheckCircle2 className="size-3 text-emerald-500" /> },
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

interface TaskRowProps {
  task: Task
  onEdit?: () => void
}

export function TaskRow({ task, onEdit }: TaskRowProps) {
  const status = STATUS_META[task.status]
  const priority = PRIORITY_META[task.priority]

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/30">
      <div title={status.label}>{status.icon}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
        {task.board && (
          <p className="text-[11px] text-muted-foreground">{task.board.name}</p>
        )}
      </div>
      <Badge variant="secondary" className={`gap-1 rounded-full ${priority.className}`}>
        {priority.icon}
        {priority.label}
      </Badge>
      {task.assignee ? (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white" title={`${task.assignee.name ?? ""} ${task.assignee.surname ?? ""}`.trim()}>
          {initialsOf(task.assignee)}
        </div>
      ) : (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-[10px] text-muted-foreground" title="Brak przypisanego">
          —
        </div>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          onClick={onEdit}
          aria-label="Edytuj zadanie"
        >
          <Pencil className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
