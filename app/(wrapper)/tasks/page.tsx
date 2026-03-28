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

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "krytyczny" | "wysoki" | "średni" | "niski"
type Filter = "assigned" | "today" | "overdue"
type GroupBy = "project" | "priority" | "status"
type View = "list" | "board"

interface Task {
  id: number
  title: string
  priority: Priority
  tags: string[]
  due: string
  dueRaw: Date
  assignees: { initials: string; color: string }[]
  done: boolean
  project: string
  status: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-28")

const ALL_TASKS: Task[] = [
  // Backend
  {
    id: 1, title: "Zaimplementować autoryzację OAuth", priority: "wysoki",
    tags: ["Backend", "Autoryzacja"], due: "31 mar", dueRaw: new Date("2026-03-31"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: false, project: "Backend", status: "W trakcie",
  },
  {
    id: 2, title: "Migracja bazy danych v3", priority: "krytyczny",
    tags: ["Backend", "DevOps"], due: "7 kwi", dueRaw: new Date("2026-04-07"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }, { initials: "MK", color: "from-amber-500 to-orange-600" }],
    done: false, project: "Backend", status: "Do zrobienia",
  },
  {
    id: 3, title: "Optymalizacja zapytań SQL", priority: "średni",
    tags: ["Backend", "Wydajność"], due: "10 kwi", dueRaw: new Date("2026-04-10"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: false, project: "Backend", status: "Do zrobienia",
  },
  {
    id: 4, title: "Napisać testy jednostkowe dla API", priority: "średni",
    tags: ["Backend", "Testy"], due: "4 kwi", dueRaw: new Date("2026-04-04"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }, { initials: "KN", color: "from-sky-500 to-cyan-600" }],
    done: false, project: "Backend", status: "Do zrobienia",
  },
  {
    id: 5, title: "Konfiguracja CI/CD pipeline", priority: "niski",
    tags: ["DevOps"], due: "25 mar", dueRaw: new Date("2026-03-25"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: true, project: "Backend", status: "Ukończone",
  },
  // Frontend
  {
    id: 6, title: "Redesign strony logowania", priority: "wysoki",
    tags: ["Frontend", "Design"], due: "28 mar", dueRaw: new Date("2026-03-28"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }, { initials: "AN", color: "from-rose-500 to-pink-600" }],
    done: false, project: "Frontend", status: "W trakcie",
  },
  {
    id: 7, title: "Zaimplementować dark mode", priority: "niski",
    tags: ["Frontend"], due: "15 kwi", dueRaw: new Date("2026-04-15"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: false, project: "Frontend", status: "Do zrobienia",
  },
  {
    id: 8, title: "Naprawić responsywność na mobile", priority: "wysoki",
    tags: ["Frontend", "Bug"], due: "26 mar", dueRaw: new Date("2026-03-26"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: false, project: "Frontend", status: "Do zrobienia",
  },
  {
    id: 9, title: "Zaktualizować dokumentację endpointów", priority: "niski",
    tags: ["Dokumentacja"], due: "7 kwi", dueRaw: new Date("2026-04-07"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: false, project: "Frontend", status: "W trakcie",
  },
  // Marketing
  {
    id: 10, title: "Przygotować landing page Q2", priority: "wysoki",
    tags: ["Marketing", "Design"], due: "28 mar", dueRaw: new Date("2026-03-28"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }, { initials: "JK", color: "from-fuchsia-500 to-purple-600" }],
    done: false, project: "Marketing", status: "W trakcie",
  },
  {
    id: 11, title: "Zaplanować kampanię email", priority: "średni",
    tags: ["Marketing"], due: "20 mar", dueRaw: new Date("2026-03-20"),
    assignees: [{ initials: "BB", color: "from-violet-500 to-indigo-600" }],
    done: false, project: "Marketing", status: "Do zrobienia",
  },
]

const PRIORITY_ORDER: Record<Priority, number> = { krytyczny: 0, wysoki: 1, średni: 2, niski: 3 }

const PRIORITY_CONFIG: Record<Priority, { label: string; icon: React.ReactNode; className: string }> = {
  krytyczny: { label: "Krytyczny", icon: <ArrowUp className="size-3" />, className: "text-red-500" },
  wysoki:    { label: "Wysoki",    icon: <ArrowUp className="size-3" />, className: "text-orange-500" },
  średni:    { label: "Średni",    icon: <Minus   className="size-3" />, className: "text-amber-500" },
  niski:     { label: "Niski",     icon: <ArrowDown className="size-3" />, className: "text-slate-400" },
}

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  project: "Projekt",
  priority: "Priorytet",
  status: "Status",
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggle,
}: {
  task: Task
  onToggle: (id: number) => void
}) {
  const p = PRIORITY_CONFIG[task.priority]
  const isOverdue = !task.done && task.dueRaw < TODAY
  const isDueToday = !task.done && task.dueRaw.toDateString() === TODAY.toDateString()

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40 ${task.done ? "opacity-60" : ""}`}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.done}
        onCheckedChange={() => onToggle(task.id)}
        className="shrink-0"
      />

      {/* Priority icon */}
      <span className={`shrink-0 ${p.className}`} title={p.label}>
        {p.icon}
      </span>

      {/* Title */}
      <span
        className={`min-w-0 flex-1 truncate text-sm font-medium ${
          task.done ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {task.title}
      </span>

      {/* Tags */}
      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        {task.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="h-5 rounded-full px-2 text-[10px] font-medium"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Due date */}
      <div
        className={`hidden shrink-0 items-center gap-1 text-[11px] font-medium sm:flex ${
          task.done
            ? "text-muted-foreground/50"
            : isOverdue
            ? "text-rose-500"
            : isDueToday
            ? "text-amber-500"
            : "text-muted-foreground"
        }`}
      >
        <CalendarDays className="size-3" />
        {task.due}
        {isOverdue && !task.done && (
          <span className="ml-0.5 rounded-full bg-rose-100 px-1 text-[9px] font-semibold text-rose-600">
            Zaległe
          </span>
        )}
        {isDueToday && !task.done && (
          <span className="ml-0.5 rounded-full bg-amber-100 px-1 text-[9px] font-semibold text-amber-600">
            Dziś
          </span>
        )}
      </div>

      {/* Assignees */}
      <div className="flex shrink-0 -space-x-1.5">
        {task.assignees.slice(0, 2).map((a) => (
          <div
            key={a.initials}
            className={`flex size-5 items-center justify-center rounded-full bg-gradient-to-br ${a.color} text-[9px] font-bold text-white ring-2 ring-background`}
          >
            {a.initials}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Task Group ───────────────────────────────────────────────────────────────

function TaskGroup({
  label,
  tasks,
  onToggle,
}: {
  label: string
  tasks: Task[]
  onToggle: (id: number) => void
}) {
  const [open, setOpen] = React.useState(true)
  const done = tasks.filter((t) => t.done).length

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
      {/* Group header */}
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
        {/* Progress bar */}
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

      {/* Tasks */}
      {open && (
        <div className="border-t border-border/40 px-2 py-1">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(ALL_TASKS)
  const [filter, setFilter] = React.useState<Filter>("assigned")
  const [groupBy, setGroupBy] = React.useState<GroupBy>("project")
  const [view, setView] = React.useState<View>("list")

  const overdueCount = tasks.filter((t) => !t.done && t.dueRaw < TODAY).length

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  // Filter
  const filtered = React.useMemo(() => {
    if (filter === "today")   return tasks.filter((t) => t.dueRaw.toDateString() === TODAY.toDateString())
    if (filter === "overdue") return tasks.filter((t) => !t.done && t.dueRaw < TODAY)
    return tasks
  }, [tasks, filter])

  // Group
  const groups = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of filtered) {
      const key =
        groupBy === "project"  ? task.project :
        groupBy === "priority" ? PRIORITY_CONFIG[task.priority].label :
        task.status
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    }
    // Sort groups
    if (groupBy === "priority") {
      return [...map.entries()].sort(([a], [b]) => {
        const pa = Object.values(PRIORITY_CONFIG).findIndex((c) => c.label === a)
        const pb = Object.values(PRIORITY_CONFIG).findIndex((c) => c.label === b)
        return pa - pb
      })
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered, groupBy])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Moje zadania
        </h1>

        {/* View toggle */}
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

      {/* ── Filters + Group by ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
          {(
            [
              { id: "assigned", label: "Przypisane do mnie" },
              { id: "today",    label: "Na dziś" },
              { id: "overdue",  label: "Zaległe" },
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

        {/* Group by */}
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

      {/* ── Task groups ───────────────────────────────────────────────────── */}
      {view === "list" ? (
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
                onToggle={toggleTask}
              />
            ))
          )}
        </div>
      ) : (
        /* Board view — simple kanban columns by status */
        <div className="grid grid-cols-3 gap-4">
          {["Do zrobienia", "W trakcie", "Ukończone"].map((col) => {
            const colTasks = filtered.filter((t) => t.status === col || (col === "Ukończone" && t.done))
            return (
              <div key={col} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">{col}</span>
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {colTasks.map((task) => {
                    const p = PRIORITY_CONFIG[task.priority]
                    return (
                      <div
                        key={task.id}
                        className={`flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-xs ${task.done ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`shrink-0 ${p.className}`}>{p.icon}</span>
                          <span className={`flex-1 text-xs font-semibold ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </span>
                          <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} className="shrink-0" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="h-4 rounded-full px-1.5 text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CalendarDays className="size-3" />
                            {task.due}
                          </div>
                          <div className="flex -space-x-1">
                            {task.assignees.slice(0, 2).map((a) => (
                              <div key={a.initials} className={`flex size-5 items-center justify-center rounded-full bg-gradient-to-br ${a.color} text-[9px] font-bold text-white ring-2 ring-card`}>
                                {a.initials}
                              </div>
                            ))}
                          </div>
                        </div>
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
