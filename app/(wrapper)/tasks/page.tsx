"use client"

import * as React from "react"
import {
  List,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  Minus,
  ArrowDown,
  CalendarDays,
  FolderKanban,
  Check,
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"
type Filter = "all" | "today" | "overdue"
type GroupBy = "project" | "priority" | "status"
type View = "list" | "board"

interface BackendTask {
  _id: Id<"tasks">
  title: string
  status: Status
  priority: Priority
  dueDate?: number
  board: { _id: Id<"boards">; name: string } | null
  workspace: { _id: Id<"workspaces">; name: string; color?: string; icon?: string } | null
}

const STATUS_LABEL: Record<Status, string> = {
  todo: "Do zrobienia",
  inprogress: "W trakcie",
  review: "Do przeglądu",
  done: "Ukończone",
}

const STATUS_ORDER: Status[] = ["todo", "inprogress", "review", "done"]

const PRIORITY_CONFIG: Record<Priority, { label: string; icon: React.ReactNode; className: string; order: number }> = {
  urgent: { label: "Krytyczny", icon: <ArrowUp className="size-3" />,   className: "text-red-500",    order: 0 },
  high:   { label: "Wysoki",    icon: <ArrowUp className="size-3" />,   className: "text-orange-500", order: 1 },
  medium: { label: "Średni",    icon: <Minus className="size-3" />,     className: "text-amber-500",  order: 2 },
  low:    { label: "Niski",     icon: <ArrowDown className="size-3" />, className: "text-slate-400",  order: 3 },
}

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  project: "Projekt",
  priority: "Priorytet",
  status: "Status",
}

const MONTHS_PL = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]

function formatDueShort(ms: number) {
  const d = new Date(ms)
  return `${d.getDate()} ${MONTHS_PL[d.getMonth()]}`
}

function startOfDay(ms: number) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function TaskRow({
  task,
  onToggle,
  isToggling,
}: {
  task: BackendTask
  onToggle: (task: BackendTask) => void
  isToggling: boolean
}) {
  const p = PRIORITY_CONFIG[task.priority]
  const done = task.status === "done"
  const todayStart = startOfDay(Date.now())
  const dueStart = task.dueDate ? startOfDay(task.dueDate) : undefined
  const isOverdue = !done && dueStart !== undefined && dueStart < todayStart
  const isDueToday = !done && dueStart !== undefined && dueStart === todayStart

  return (
    <div className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40 ${done ? "opacity-60" : ""}`}>
      <Checkbox
        checked={done}
        onCheckedChange={() => onToggle(task)}
        disabled={isToggling}
        className="shrink-0"
      />

      <span className={`shrink-0 ${p.className}`} title={p.label}>
        {p.icon}
      </span>

      <span className={`min-w-0 flex-1 truncate text-sm font-medium ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {task.title}
      </span>

      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        {task.workspace && (
          <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] font-medium">
            {task.workspace.icon ? `${task.workspace.icon} ` : ""}{task.workspace.name}
          </Badge>
        )}
        {task.board && (
          <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] font-medium">
            {task.board.name}
          </Badge>
        )}
      </div>

      {task.dueDate !== undefined && (
        <div
          className={`hidden shrink-0 items-center gap-1 text-[11px] font-medium sm:flex ${
            done
              ? "text-muted-foreground/50"
              : isOverdue
              ? "text-rose-500"
              : isDueToday
              ? "text-amber-500"
              : "text-muted-foreground"
          }`}
        >
          <CalendarDays className="size-3" />
          {formatDueShort(task.dueDate)}
          {isOverdue && (
            <span className="ml-0.5 rounded-full bg-rose-100 px-1 text-[9px] font-semibold text-rose-600">
              Zaległe
            </span>
          )}
          {isDueToday && (
            <span className="ml-0.5 rounded-full bg-amber-100 px-1 text-[9px] font-semibold text-amber-600">
              Dziś
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function TaskGroup({
  label,
  tasks,
  onToggle,
  togglingId,
}: {
  label: string
  tasks: BackendTask[]
  onToggle: (task: BackendTask) => void
  togglingId: Id<"tasks"> | null
}) {
  const [open, setOpen] = React.useState(true)
  const done = tasks.filter((t) => t.status === "done").length

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
          {tasks.length}
        </span>
        {done > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
            <Check className="size-3" />
            {done}/{tasks.length}
          </span>
        )}
        <div className="ml-auto flex w-20 items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground/50">
            {tasks.length ? Math.round((done / tasks.length) * 100) : 0}%
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border/40 px-2 py-1">
          {tasks.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              onToggle={onToggle}
              isToggling={togglingId === task._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyTasksPage() {
  const tasks = useQuery(api.tasks.listMine)
  const updateTask = useMutation(api.tasks.update)

  const [filter, setFilter] = React.useState<Filter>("all")
  const [groupBy, setGroupBy] = React.useState<GroupBy>("project")
  const [view, setView] = React.useState<View>("list")
  const [togglingId, setTogglingId] = React.useState<Id<"tasks"> | null>(null)

  const todayStart = startOfDay(Date.now())

  const overdueCount = React.useMemo(
    () =>
      (tasks ?? []).filter(
        (t) =>
          t.status !== "done" &&
          t.dueDate !== undefined &&
          startOfDay(t.dueDate) < todayStart,
      ).length,
    [tasks, todayStart],
  )

  async function handleToggle(task: BackendTask) {
    setTogglingId(task._id)
    try {
      await updateTask({
        id: task._id,
        status: task.status === "done" ? "todo" : "done",
      })
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = React.useMemo(() => {
    if (!tasks) return []
    if (filter === "today")
      return tasks.filter(
        (t) => t.dueDate !== undefined && startOfDay(t.dueDate) === todayStart,
      )
    if (filter === "overdue")
      return tasks.filter(
        (t) =>
          t.status !== "done" &&
          t.dueDate !== undefined &&
          startOfDay(t.dueDate) < todayStart,
      )
    return tasks
  }, [tasks, filter, todayStart])

  const groups = React.useMemo<[string, BackendTask[]][]>(() => {
    const map = new Map<string, BackendTask[]>()
    for (const task of filtered) {
      const key =
        groupBy === "project"
          ? task.workspace?.name ?? "Bez projektu"
          : groupBy === "priority"
          ? PRIORITY_CONFIG[task.priority].label
          : STATUS_LABEL[task.status]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    }
    if (groupBy === "priority") {
      return [...map.entries()].sort(([a], [b]) => {
        const pa = Object.values(PRIORITY_CONFIG).find((c) => c.label === a)?.order ?? 99
        const pb = Object.values(PRIORITY_CONFIG).find((c) => c.label === b)?.order ?? 99
        return pa - pb
      })
    }
    if (groupBy === "status") {
      return [...map.entries()].sort(([a], [b]) => {
        const pa = STATUS_ORDER.findIndex((s) => STATUS_LABEL[s] === a)
        const pb = STATUS_ORDER.findIndex((s) => STATUS_LABEL[s] === b)
        return pa - pb
      })
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered, groupBy])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Moje zadania
        </h1>

        <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="size-3.5" />
            Lista
          </button>
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              view === "board"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Tablica
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
          {(
            [
              { id: "all",     label: "Wszystkie" },
              { id: "today",   label: "Na dziś" },
              { id: "overdue", label: "Zaległe" },
            ] as { id: Filter; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.id === "overdue" && overdueCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <FolderKanban className="size-3.5" />
              Grupuj według:
              <span className="font-semibold">{GROUP_BY_LABELS[groupBy]}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs">Grupuj według</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={groupBy}
              onValueChange={(v) => setGroupBy(v as GroupBy)}
            >
              <DropdownMenuRadioItem value="project"  className="text-xs">Projekt</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="priority" className="text-xs">Priorytet</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status"   className="text-xs">Status</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {tasks === undefined && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      )}

      {tasks && view === "list" && (
        <div className="flex flex-col gap-3">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
              <Check className="size-8 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">Wszystko gotowe!</p>
              <p className="text-xs text-muted-foreground">Brak zadań spełniających kryteria.</p>
            </div>
          ) : (
            groups.map(([label, groupTasks]) => (
              <TaskGroup
                key={label}
                label={label}
                tasks={groupTasks}
                onToggle={handleToggle}
                togglingId={togglingId}
              />
            ))
          )}
        </div>
      )}

      {tasks && view === "board" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_ORDER.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col)
            return (
              <div key={col} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">{STATUS_LABEL[col]}</span>
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {colTasks.map((task) => {
                    const p = PRIORITY_CONFIG[task.priority]
                    const done = task.status === "done"
                    return (
                      <div
                        key={task._id}
                        className={`flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-xs ${done ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`shrink-0 ${p.className}`}>{p.icon}</span>
                          <span className={`flex-1 text-xs font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </span>
                          <Checkbox
                            checked={done}
                            onCheckedChange={() => handleToggle(task)}
                            disabled={togglingId === task._id}
                            className="shrink-0"
                          />
                        </div>
                        {task.workspace && (
                          <Badge variant="secondary" className="w-fit h-4 rounded-full px-1.5 text-[10px]">
                            {task.workspace.icon ? `${task.workspace.icon} ` : ""}{task.workspace.name}
                          </Badge>
                        )}
                        {task.dueDate !== undefined && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CalendarDays className="size-3" />
                            {formatDueShort(task.dueDate)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
