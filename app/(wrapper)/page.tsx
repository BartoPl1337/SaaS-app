"use client"

import * as React from "react"
import {
  Plus,
  Zap,
  ArrowRight,
  LayoutGrid,
  Clock,
  CircleDot,
  AlertCircle,
  CheckCircle2,
  Circle,
  ChevronRight,
  CalendarDays,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TaskDetailDialog, type TaskDetail } from "@/components/task-detail-dialog"

// ─── Data ────────────────────────────────────────────────────────────────────

const BOARDS = [
  {
    id: 1,
    name: "Redesign strony głównej",
    description: "Nowy wygląd i UX dla landing page",
    tasks: 12,
    done: 8,
    members: ["BB", "KN", "TW"],
    color: "from-violet-500 to-indigo-600",
    dot: "bg-violet-500",
    updatedAt: "2 godz. temu",
  },
  {
    id: 2,
    name: "Sprint Q2 – Backend",
    description: "API, migracje baz danych, optymalizacje",
    tasks: 24,
    done: 11,
    members: ["BB", "MK"],
    color: "from-sky-500 to-cyan-600",
    dot: "bg-sky-500",
    updatedAt: "wczoraj",
  },
  {
    id: 3,
    name: "Kampania marketingowa",
    description: "Treści, grafiki, harmonogram publikacji",
    tasks: 9,
    done: 9,
    members: ["JK", "AN", "TW"],
    color: "from-emerald-500 to-teal-600",
    dot: "bg-emerald-500",
    updatedAt: "3 dni temu",
  },
]

const ACTIVITY = [
  { id: 1, user: "BB", userColor: "from-violet-500 to-indigo-600", action: "ukończył zadanie", target: "Projekt API v2", time: "przed chwilą" },
  { id: 2, user: "KN", userColor: "from-sky-500 to-cyan-600", action: "dodał komentarz w", target: "Redesign strony", time: "12 min" },
  { id: 3, user: "MK", userColor: "from-amber-500 to-orange-600", action: "przesunął zadanie do", target: "W trakcie", time: "1 godz." },
  { id: 4, user: "TW", userColor: "from-emerald-500 to-teal-600", action: "utworzył tablicę", target: "Marketing Q2", time: "3 godz." },
  { id: 5, user: "AN", userColor: "from-rose-500 to-pink-600", action: "przypisał zadanie do", target: "@bartosz", time: "wczoraj" },
  { id: 6, user: "JK", userColor: "from-fuchsia-500 to-purple-600", action: "zamknął sprint", target: "Sprint #14", time: "2 dni" },
  { id: 7, user: "BB", userColor: "from-violet-500 to-indigo-600", action: "zaktualizował priorytet", target: "Migracja DB", time: "3 dni" },
]

const TASKS = [
  { id: 1, name: "Zaimplementować autoryzację OAuth", status: "w trakcie", priority: "wysoki", due: "31 mar 2026", active: true },
  { id: 2, name: "Napisać testy jednostkowe dla API", status: "do zrobienia", priority: "średni", due: "4 kwi 2026", active: true },
  { id: 3, name: "Zaktualizować dokumentację endpointów", status: "w trakcie", priority: "niski", due: "7 kwi 2026", active: true },
  { id: 4, name: "Code review – moduł płatności", status: "ukończone", priority: "wysoki", due: "28 mar 2026", active: false },
  { id: 5, name: "Optymalizacja zapytań SQL", status: "do zrobienia", priority: "średni", due: "10 kwi 2026", active: true },
]

const TASK_DETAILS: Record<number, TaskDetail> = {
  1: {
    id: 1,
    name: "Zaimplementować autoryzację OAuth",
    description: "Dodanie obsługi logowania przez Google, GitHub oraz Apple Sign-In. Należy zintegrować z istniejącym systemem sesji i zapewnić poprawne odświeżanie tokenów. Wymagana obsługa błędów i edge case'ów.",
    status: "w trakcie",
    priority: "wysoki",
    due: "31 mar 2026",
    assignee: { initials: "BB", name: "Bartosz B.", color: "from-violet-500 to-indigo-600" },
    labels: ["Backend", "Autoryzacja"],
    attachments: [
      { name: "oauth-flow.png", size: "1.2 MB", type: "image" },
      { name: "specyfikacja.pdf", size: "340 KB", type: "file" },
    ],
    comments: [
      { id: 1, author: "Karolina N.", initials: "KN", color: "from-sky-500 to-cyan-600", text: "Sprawdziłam dokumentację Google – callback URL trzeba zmienić na nowy endpoint.", time: "2 godz. temu" },
      { id: 2, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", text: "Dzięki, zaktualizuję. Czy Apple Sign-In wymaga dodatkowego certyfikatu?", time: "1 godz. temu" },
    ],
    history: [
      { id: 1, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", action: "zmienił status na „W trakcie", time: "1 godz. temu" },
      { id: 2, author: "Marcin K.", initials: "MK", color: "from-amber-500 to-orange-600", action: "przypisał zadanie do Bartosz B.", time: "wczoraj, 14:32" },
      { id: 3, author: "Tomasz W.", initials: "TW", color: "from-emerald-500 to-teal-600", action: "utworzył zadanie", time: "3 dni temu" },
    ],
  },
  2: {
    id: 2,
    name: "Napisać testy jednostkowe dla API",
    description: "Pokrycie testami wszystkich endpointów v2. Minimalne pokrycie kodu: 80%. Testy powinny uwzględniać scenariusze błędów, walidację inputów oraz edge case'y dla każdego kontrolera.",
    status: "do zrobienia",
    priority: "średni",
    due: "4 kwi 2026",
    assignee: { initials: "KN", name: "Karolina N.", color: "from-sky-500 to-cyan-600" },
    labels: ["Testy", "Backend"],
    attachments: [
      { name: "test-plan.docx", size: "89 KB", type: "file" },
    ],
    comments: [
      { id: 1, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", text: "Używamy Jest czy Vitest? Warto ujednolicić przed startem.", time: "wczoraj" },
    ],
    history: [
      { id: 1, author: "Karolina N.", initials: "KN", color: "from-sky-500 to-cyan-600", action: "zaakceptowała zadanie", time: "2 dni temu" },
      { id: 2, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", action: "utworzył zadanie", time: "4 dni temu" },
    ],
  },
  3: {
    id: 3,
    name: "Zaktualizować dokumentację endpointów",
    description: "Aktualizacja Swaggera dla całego API v2, dodanie przykładów request/response oraz opisów parametrów. Uwzględnić nowe endpointy dodane w ostatnim sprincie.",
    status: "w trakcie",
    priority: "niski",
    due: "7 kwi 2026",
    assignee: { initials: "AN", name: "Anna N.", color: "from-rose-500 to-pink-600" },
    labels: ["Dokumentacja"],
    attachments: [],
    comments: [],
    history: [
      { id: 1, author: "Anna N.", initials: "AN", color: "from-rose-500 to-pink-600", action: "zaczęła pracę nad zadaniem", time: "dzisiaj, 9:00" },
      { id: 2, author: "Tomasz W.", initials: "TW", color: "from-emerald-500 to-teal-600", action: "utworzył zadanie", time: "tydzień temu" },
    ],
  },
  4: {
    id: 4,
    name: "Code review – moduł płatności",
    description: "Przegląd kodu nowego modułu płatności: integracja Stripe, obsługa webhooków, bezpieczeństwo tokenów. Zadanie ukończone i zatwierdzone do merge.",
    status: "ukończone",
    priority: "wysoki",
    due: "28 mar 2026",
    assignee: { initials: "MK", name: "Marcin K.", color: "from-amber-500 to-orange-600" },
    labels: ["Płatności", "Security"],
    attachments: [
      { name: "review-notes.md", size: "12 KB", type: "file" },
      { name: "stripe-diagram.png", size: "450 KB", type: "image" },
    ],
    comments: [
      { id: 1, author: "Marcin K.", initials: "MK", color: "from-amber-500 to-orange-600", text: "Review zakończony. Wszystkie uwagi poprawione, PR gotowy do merge.", time: "28 mar" },
    ],
    history: [
      { id: 1, author: "Marcin K.", initials: "MK", color: "from-amber-500 to-orange-600", action: "oznaczył zadanie jako ukończone", time: "28 mar, 16:45" },
      { id: 2, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", action: "przypisał zadanie do Marcin K.", time: "25 mar" },
    ],
  },
  5: {
    id: 5,
    name: "Optymalizacja zapytań SQL",
    description: "Analiza slow query log, dodanie brakujących indeksów, eliminacja zapytań N+1 w głównych listingach. Cel: redukcja czasu odpowiedzi p95 o minimum 40%.",
    status: "do zrobienia",
    priority: "średni",
    due: "10 kwi 2026",
    assignee: { initials: "TW", name: "Tomasz W.", color: "from-emerald-500 to-teal-600" },
    labels: ["Wydajność", "Baza danych"],
    attachments: [
      { name: "slow-queries.csv", size: "220 KB", type: "file" },
    ],
    comments: [
      { id: 1, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", text: "Mam już listę 12 zapytań do optymalizacji z Datadog.", time: "3 dni temu" },
      { id: 2, author: "Tomasz W.", initials: "TW", color: "from-emerald-500 to-teal-600", text: "Dzięki, biorę się za to po zakończeniu CI/CD.", time: "3 dni temu" },
    ],
    history: [
      { id: 1, author: "Tomasz W.", initials: "TW", color: "from-emerald-500 to-teal-600", action: "dodał załącznik slow-queries.csv", time: "3 dni temu" },
      { id: 2, author: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600", action: "utworzył zadanie", time: "5 dni temu" },
    ],
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    "w trakcie": { label: "W trakcie", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <CircleDot className="size-3" /> },
    "do zrobienia": { label: "Do zrobienia", className: "border-border bg-muted/60 text-muted-foreground", icon: <Circle className="size-3" /> },
    ukończone: { label: "Ukończone", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="size-3" /> },
  }
  const s = map[status] ?? map["do zrobienia"]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {s.icon}{s.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; className: string }> = {
    wysoki: { label: "Wysoki", className: "text-rose-600 bg-rose-50 border-rose-200" },
    średni: { label: "Średni", className: "text-amber-600 bg-amber-50 border-amber-200" },
    niski: { label: "Niski", className: "text-slate-500 bg-slate-50 border-slate-200" },
  }
  const p = map[priority] ?? map["niski"]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${p.className}`}>
      <AlertCircle className="size-2.5" />{p.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const activeTasks = TASKS.filter((t) => t.active).length
  const [selectedTask, setSelectedTask] = React.useState<TaskDetail | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  function openTask(id: number) {
    setSelectedTask(TASK_DETAILS[id] ?? null)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── 1. Welcome ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Witaj ponownie, Bartosz 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Oto co dziś się dzieje w Twoim workspace.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <LayoutGrid className="size-3.5" />
            Utwórz tablicę
          </Button>
          <Button size="sm" className="h-8 gap-1.5">
            <Zap className="size-3.5" />
            Szybkie zadanie
          </Button>
        </div>
      </div>

      {/* ── 2+3. Main grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5">

        {/* Boards — col 1–3 */}
        <div className="col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Ostatnie tablice</h2>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
              Zobacz wszystkie <ArrowRight className="size-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {BOARDS.map((board) => {
              const pct = Math.round((board.done / board.tasks) * 100)
              return (
                <div key={board.id} className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 size-2.5 shrink-0 rounded-full ${board.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{board.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{board.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{board.done}/{board.tasks} zadań</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full bg-gradient-to-r ${board.color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {board.members.map((m) => (
                        <div key={m} className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-card">{m}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />{board.updatedAt}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity — col 4, spans 2 rows */}
        <div className="col-span-1 row-span-2 flex flex-col rounded-xl border border-border/60 bg-card shadow-xs">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Ostatnia aktywność</h2>
            <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground">
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
          <div className="flex flex-1 flex-col divide-y divide-border/40 overflow-y-auto">
            {ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 px-4 py-3">
                <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.userColor} text-[9px] font-bold text-white`}>
                  {item.user}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground leading-snug">
                    <span className="font-medium text-foreground">{item.user} </span>
                    {item.action}{" "}
                    <span className="font-medium text-foreground">{item.target}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks — col 1–3 */}
        <div className="col-span-3 rounded-xl border border-border/60 bg-card shadow-xs">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Moje zadania</h2>
            <Badge variant="secondary" className="h-5 gap-1 rounded-full px-2 text-[11px] font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Aktywne: {activeTasks}
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-4 text-xs font-medium text-muted-foreground">Nazwa zadania</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Priorytet</TableHead>
                <TableHead className="pr-4 text-xs font-medium text-muted-foreground">Termin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TASKS.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer border-border/40 hover:bg-muted/30"
                  onClick={() => openTask(task.id)}
                >
                  <TableCell className="pl-4">
                    <span className={`text-sm font-medium ${task.status === "ukończone" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {task.name}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={task.status} /></TableCell>
                  <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" />{task.due}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* Task detail dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
