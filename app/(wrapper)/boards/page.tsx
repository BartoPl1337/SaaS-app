"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  CalendarDays,
  MoreHorizontal,
  ArrowUp,
  Minus,
  ArrowDown,
  CheckCheck,
  ChevronDown,
} from "lucide-react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateTaskDialog } from "@/components/create-task-dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"

interface Assignee {
  _id?: string
  name?: string
  surname?: string
  email?: string
  image?: string | null
}

interface BackendTask {
  _id: Id<"tasks">
  title: string
  description?: string
  status: Status
  priority: Priority
  dueDate?: number
  assignee: Assignee | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const COLUMNS: { id: Status; label: string; color: string; dot: string }[] = [
  { id: "todo",       label: "Do zrobienia", color: "text-slate-600",   dot: "bg-slate-400" },
  { id: "inprogress", label: "W toku",       color: "text-sky-600",     dot: "bg-sky-500" },
  { id: "review",     label: "Do przeglądu", color: "text-amber-600",   dot: "bg-amber-500" },
  { id: "done",       label: "Gotowe",       color: "text-emerald-600", dot: "bg-emerald-500" },
]

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; icon: React.ReactNode }> = {
  urgent: {
    label: "Krytyczny",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <ArrowUp className="size-3" />,
  },
  high: {
    label: "Wysoki",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: <ArrowUp className="size-3" />,
  },
  medium: {
    label: "Średni",
    className: "border-amber-200 bg-amber-50 text-amber-600",
    icon: <Minus className="size-3" />,
  },
  low: {
    label: "Niski",
    className: "border-slate-200 bg-slate-50 text-slate-500",
    icon: <ArrowDown className="size-3" />,
  },
}

const ASSIGNEE_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
]

const PL_MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]

function formatDue(ts: number): string {
  const d = new Date(ts)
  return `${d.getDate()} ${PL_MONTHS[d.getMonth()]}`
}

function initialsOf(user: Assignee): string {
  const a = user.name?.[0] ?? ""
  const b = user.surname?.[0] ?? ""
  const out = (a + b).toUpperCase()
  return out || user.email?.[0]?.toUpperCase() || "?"
}

function gradientFor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return ASSIGNEE_GRADIENTS[Math.abs(hash) % ASSIGNEE_GRADIENTS.length]
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onStatusChange,
}: {
  task: BackendTask
  onStatusChange: (id: Id<"tasks">, status: Status) => void
}) {
  const isDone = task.status === "done"
  const p = PRIORITY_CONFIG[task.priority]
  const assigneeKey = task.assignee?._id ?? task.assignee?.email ?? ""

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
              onClick={() => onStatusChange(task._id, "todo")}
            >
              <span className="size-2 rounded-full bg-slate-400" />
              Do zrobienia
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => onStatusChange(task._id, "inprogress")}
            >
              <span className="size-2 rounded-full bg-sky-500" />
              W toku
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => onStatusChange(task._id, "review")}
            >
              <span className="size-2 rounded-full bg-amber-500" />
              Do przeglądu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-xs text-emerald-600 focus:text-emerald-600"
              onClick={() => onStatusChange(task._id, "done")}
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
        {task.description && (
          <p className={`mt-1 text-xs leading-relaxed ${isDone ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
            {task.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div
              className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(assigneeKey)} text-[9px] font-bold text-white ring-2 ring-card ${isDone ? "opacity-50 grayscale" : ""}`}
              title={[task.assignee.name, task.assignee.surname].filter(Boolean).join(" ") || task.assignee.email || "Przypisany"}
            >
              {initialsOf(task.assignee)}
            </div>
          ) : (
            <div className="flex size-6 items-center justify-center rounded-full border border-dashed border-border text-[9px] text-muted-foreground" title="Brak przypisanego">
              —
            </div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-[11px] ${isDone ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
            <CalendarDays className="size-3" />
            {formatDue(task.dueDate)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BoardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectParam = searchParams.get("project")

  const projects = useQuery(api.projects.list)
  const updateTask = useMutation(api.tasks.update)

  const selectedId = React.useMemo<Id<"workspaces"> | null>(() => {
    if (!projects || projects.length === 0) return null
    const found = projectParam && projects.find((p) => p._id === projectParam)
    if (found) return found._id as Id<"workspaces">
    return projects[0]._id as Id<"workspaces">
  }, [projects, projectParam])

  const tasks = useQuery(
    api.tasks.listByProject,
    selectedId ? { workspaceId: selectedId } : "skip",
  )

  const selectedProject = projects?.find((p) => p._id === selectedId) ?? null

  const [createTaskOpen, setCreateTaskOpen] = React.useState(false)

  function selectProject(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("project", id)
    router.replace(`/boards?${params.toString()}`)
  }

  async function handleStatusChange(id: Id<"tasks">, status: Status) {
    try {
      await updateTask({ id, status })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zmienić statusu")
    }
  }

  // ─── No projects ──────────────────────────────────────────────────────────
  if (projects && projects.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Roadmapa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzanie kluczowymi aktualizacjami i postępem prac zespołu.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border/60 px-6 py-16 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnych projektów. Utwórz projekt, aby zobaczyć roadmapę.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {selectedProject ? `Roadmapa — ${selectedProject.name}` : "Roadmapa"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzanie kluczowymi aktualizacjami i postępem prac zespołu.
          </p>
        </div>

        {/* Project selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={!projects}>
              {selectedProject ? (
                <>
                  <span>{selectedProject.icon ?? "📁"}</span>
                  <span className="max-w-[200px] truncate">{selectedProject.name}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Wybierz projekt</span>
              )}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs">Projekt</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects?.map((p) => (
              <DropdownMenuItem
                key={p._id}
                className="gap-2 text-sm"
                onClick={() => selectProject(p._id)}
              >
                <span>{p.icon ?? "📁"}</span>
                <span className="truncate">{p.name}</span>
                {p._id === selectedId && (
                  <CheckCheck className="ml-auto size-3.5 text-emerald-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loading state */}
      {tasks === undefined && (
        <div className="grid min-h-0 flex-1 grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${col.dot}`} />
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
              </div>
              <div className={`h-0.5 w-full rounded-full ${col.dot} opacity-30`} />
              <div className="h-20 animate-pulse rounded-xl bg-muted/50" />
              <div className="h-20 animate-pulse rounded-xl bg-muted/50" />
            </div>
          ))}
        </div>
      )}

      {/* Kanban grid */}
      {tasks && (
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
                      key={task._id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>

                {/* Add task button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateTaskOpen(true)}
                  className="mt-1 h-8 w-full justify-start gap-1.5 border border-dashed border-border/50 text-xs text-muted-foreground hover:border-border hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Dodaj zadanie
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {selectedId && (
        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
          defaultWorkspaceId={selectedId}
        />
      )}
    </div>
  )
}
