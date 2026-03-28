"use client"

import * as React from "react"
import {
  Plus,
  MessageSquare,
  CalendarDays,
  MoreHorizontal,
  ArrowUp,
  Minus,
  ArrowDown,
  CheckCheck,
  MoveRight,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "krytyczny" | "wysoki" | "średni" | "niski"
type Status = "todo" | "inprogress" | "review" | "done"

interface Task {
  id: number
  title: string
  description: string
  priority: Priority
  status: Status
  assignees: { initials: string; color: string }[]
  comments: number
  due: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
  // Do zrobienia
  {
    id: 1,
    title: "Zaprojektować nowy onboarding",
    description: "Przeprojektowanie flow rejestracji dla nowych użytkowników.",
    priority: "wysoki",
    status: "todo",
    assignees: [
      { initials: "BB", color: "from-violet-500 to-indigo-600" },
      { initials: "KN", color: "from-sky-500 to-cyan-600" },
    ],
    comments: 5,
    due: "4 kwi",
  },
  {
    id: 2,
    title: "Migracja bazy danych v3",
    description: "Aktualizacja schematu i skryptów migracyjnych.",
    priority: "krytyczny",
    status: "todo",
    assignees: [{ initials: "MK", color: "from-amber-500 to-orange-600" }],
    comments: 2,
    due: "7 kwi",
  },
  {
    id: 3,
    title: "Integracja z systemem płatności",
    description: "Podłączenie Stripe i obsługa webhooków.",
    priority: "średni",
    status: "todo",
    assignees: [
      { initials: "TW", color: "from-emerald-500 to-teal-600" },
      { initials: "AN", color: "from-rose-500 to-pink-600" },
    ],
    comments: 0,
    due: "12 kwi",
  },
  // W toku
  {
    id: 4,
    title: "Implementacja autoryzacji OAuth",
    description: "Obsługa Google, GitHub oraz Apple Sign-In.",
    priority: "wysoki",
    status: "inprogress",
    assignees: [
      { initials: "BB", color: "from-violet-500 to-indigo-600" },
    ],
    comments: 8,
    due: "31 mar",
  },
  {
    id: 5,
    title: "Refaktoryzacja modułu raportów",
    description: "Podział na mniejsze komponenty, poprawa wydajności.",
    priority: "niski",
    status: "inprogress",
    assignees: [
      { initials: "KN", color: "from-sky-500 to-cyan-600" },
      { initials: "JK", color: "from-fuchsia-500 to-purple-600" },
    ],
    comments: 3,
    due: "2 kwi",
  },
  // Do przeglądu
  {
    id: 6,
    title: "Dashboard analityczny",
    description: "Wykresy sprzedaży, konwersji i aktywności użytkowników.",
    priority: "średni",
    status: "review",
    assignees: [
      { initials: "AN", color: "from-rose-500 to-pink-600" },
    ],
    comments: 12,
    due: "30 mar",
  },
  {
    id: 7,
    title: "Optymalizacja zapytań SQL",
    description: "Indeksy, cache'owanie i eliminacja N+1.",
    priority: "wysoki",
    status: "review",
    assignees: [
      { initials: "MK", color: "from-amber-500 to-orange-600" },
      { initials: "TW", color: "from-emerald-500 to-teal-600" },
    ],
    comments: 4,
    due: "1 kwi",
  },
  // Gotowe
  {
    id: 8,
    title: "Konfiguracja CI/CD pipeline",
    description: "GitHub Actions, testy automatyczne i deploy na staging.",
    priority: "wysoki",
    status: "done",
    assignees: [
      { initials: "BB", color: "from-violet-500 to-indigo-600" },
      { initials: "KN", color: "from-sky-500 to-cyan-600" },
    ],
    comments: 6,
    due: "25 mar",
  },
  {
    id: 9,
    title: "Dokumentacja API v2",
    description: "Swagger + przykłady użycia dla każdego endpointu.",
    priority: "niski",
    status: "done",
    assignees: [{ initials: "JK", color: "from-fuchsia-500 to-purple-600" }],
    comments: 1,
    due: "22 mar",
  },
]

const COLUMNS: { id: Status; label: string; color: string; dot: string }[] = [
  { id: "todo",       label: "Do zrobienia", color: "text-slate-600",   dot: "bg-slate-400" },
  { id: "inprogress", label: "W toku",       color: "text-sky-600",     dot: "bg-sky-500" },
  { id: "review",     label: "Do przeglądu", color: "text-amber-600",   dot: "bg-amber-500" },
  { id: "done",       label: "Gotowe",       color: "text-emerald-600", dot: "bg-emerald-500" },
]

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; icon: React.ReactNode }> = {
  krytyczny: {
    label: "Krytyczny",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <ArrowUp className="size-3" />,
  },
  wysoki: {
    label: "Wysoki",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: <ArrowUp className="size-3" />,
  },
  średni: {
    label: "Średni",
    className: "border-amber-200 bg-amber-50 text-amber-600",
    icon: <Minus className="size-3" />,
  },
  niski: {
    label: "Niski",
    className: "border-slate-200 bg-slate-50 text-slate-500",
    icon: <ArrowDown className="size-3" />,
  },
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task
  onStatusChange: (id: number, status: Status) => void
}) {
  const isDone = task.status === "done"
  const p = PRIORITY_CONFIG[task.priority]

  return (
    <div
      className={`group flex flex-col gap-3 rounded-xl border p-3.5 shadow-xs transition-shadow hover:shadow-md ${
        isDone
          ? "border-border/40 bg-muted/30"
          : "border-border/60 bg-card"
      }`}
    >
      {/* Priority + actions */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${p.className} ${isDone ? "opacity-50" : ""}`}
        >
          {p.icon}
          {p.label} priorytet
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">Zmień status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => onStatusChange(task.id, "todo")}
            >
              <span className="size-2 rounded-full bg-slate-400" />
              Do zrobienia
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => onStatusChange(task.id, "inprogress")}
            >
              <span className="size-2 rounded-full bg-sky-500" />
              W toku
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => onStatusChange(task.id, "review")}
            >
              <span className="size-2 rounded-full bg-amber-500" />
              Do przeglądu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-xs text-emerald-600 focus:text-emerald-600"
              onClick={() => onStatusChange(task.id, "done")}
            >
              <CheckCheck className="size-3.5" />
              Oznacz jako gotowe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title + description */}
      <div>
        <p
          className={`text-sm font-semibold leading-snug ${
            isDone ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        <p className={`mt-1 text-xs leading-relaxed ${isDone ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          {task.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Avatars + comments */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 2).map((a) => (
              <div
                key={a.initials}
                className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-br ${a.color} text-[9px] font-bold text-white ring-2 ring-card ${isDone ? "opacity-50 grayscale" : ""}`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          {task.comments > 0 && (
            <div className={`flex items-center gap-1 text-[11px] ${isDone ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
              <MessageSquare className="size-3" />
              {task.comments}
            </div>
          )}
        </div>

        {/* Due date */}
        <div className={`flex items-center gap-1 text-[11px] ${isDone ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
          <CalendarDays className="size-3" />
          {task.due}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BoardsPage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS)

  const handleStatusChange = (id: number, status: Status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Roadmapa produktu XYZ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Zarządzanie kluczowymi aktualizacjami i postępem prac zespołu.
        </p>
      </div>

      {/* Kanban grid */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div key={col.id} className="flex flex-col gap-3">

              {/* Column header */}
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${col.dot}`} />
                <span className={`text-sm font-semibold ${col.color}`}>
                  {col.label}
                </span>
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>

              {/* Thin accent line */}
              <div className={`h-0.5 w-full rounded-full ${col.dot} opacity-30`} />

              {/* Cards */}
              <div className="flex flex-col gap-2.5">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>

              {/* Add task button */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-8 w-full justify-start gap-1.5 border border-dashed border-border/50 text-xs text-muted-foreground hover:border-border hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Dodaj zadanie
              </Button>

            </div>
          )
        })}
      </div>
    </div>
  )
}
