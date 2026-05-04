"use client"

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleDot,
  LayoutGrid,
  Minus,
} from "lucide-react"

import Link from "next/link"
import { useQuery } from "convex/react"

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
import { RecentBoardCard } from "@/components/boards/recent-board-card"
import { RecentActivityCard } from "@/components/activity/recent-activity-card"
import { api } from "@/convex/_generated/api"

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"

const STATUS_META: Record<Status, { label: string; icon: React.ReactNode; className: string }> = {
  todo:       { label: "Do zrobienia", icon: <Circle       className="size-3" />, className: "border-border bg-muted/60 text-muted-foreground" },
  inprogress: { label: "W trakcie",    icon: <CircleDot    className="size-3" />, className: "border-sky-200 bg-sky-50 text-sky-700" },
  review:     { label: "Do przeglądu", icon: <CircleDot    className="size-3" />, className: "border-amber-200 bg-amber-50 text-amber-700" },
  done:       { label: "Ukończone",    icon: <CheckCircle2 className="size-3" />, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
}

const PRIORITY_META: Record<Priority, { label: string; icon: React.ReactNode; className: string }> = {
  urgent: { label: "Krytyczny", icon: <ArrowUp className="size-3" />,   className: "text-red-600 bg-red-50 border-red-200" },
  high:   { label: "Wysoki",    icon: <ArrowUp className="size-3" />,   className: "text-orange-600 bg-orange-50 border-orange-200" },
  medium: { label: "Średni",    icon: <Minus className="size-3" />,     className: "text-amber-600 bg-amber-50 border-amber-200" },
  low:    { label: "Niski",     icon: <ArrowDown className="size-3" />, className: "text-slate-500 bg-slate-50 border-slate-200" },
}

const MONTHS_PL = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]

function formatDueShort(ms: number) {
  const d = new Date(ms)
  return `${d.getDate()} ${MONTHS_PL[d.getMonth()]}`
}

export default function DashboardPage() {
  const recentBoards = useQuery(api.projects.listRecentBoards, { limit: 3 })
  const myTasks = useQuery(api.tasks.listMine)

  const activeTasks = (myTasks ?? []).filter((t) => t.status !== "done")
  const visibleTasks = activeTasks.slice(0, 5)

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Witaj ponownie, Bartosz
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Oto co dziś się dzieje w Twoim workspace.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
          <Link href="/projects">
            <LayoutGrid className="size-3.5" />
            Projekty
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Ostatnie tablice</h2>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/projects">Zobacz wszystkie <ArrowRight className="size-3" /></Link>
              </Button>
            </div>
            {recentBoards === undefined && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            )}
            {recentBoards && recentBoards.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
                Brak tablic. Utwórz projekt, aby zacząć.
              </div>
            )}
            {recentBoards && recentBoards.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recentBoards.map((board) => (
                  <RecentBoardCard key={board._id} board={board} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Moje zadania</h2>
                <Badge variant="secondary" className="h-5 gap-1 rounded-full px-2 text-[11px] font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Aktywne: {activeTasks.length}
                </Badge>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/tasks">Zobacz wszystkie <ArrowRight className="size-3" /></Link>
              </Button>
            </div>

            {myTasks === undefined && (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-muted/50" />
                ))}
              </div>
            )}

            {myTasks && visibleTasks.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                {myTasks.length === 0
                  ? "Nie masz przypisanych zadań."
                  : "Wszystko gotowe — brak aktywnych zadań."}
              </div>
            )}

            {myTasks && visibleTasks.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="pl-4 text-xs font-medium text-muted-foreground">Nazwa zadania</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Projekt</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Priorytet</TableHead>
                    <TableHead className="pr-4 text-xs font-medium text-muted-foreground">Termin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTasks.map((task) => {
                    const status = STATUS_META[task.status as Status]
                    const priority = PRIORITY_META[task.priority as Priority]
                    const projectHref = task.workspace ? `/projects/${task.workspace._id}` : null
                    return (
                      <TableRow key={task._id} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="pl-4">
                          <span className="text-sm font-medium text-foreground">{task.title}</span>
                        </TableCell>
                        <TableCell>
                          {projectHref ? (
                            <Link
                              href={projectHref}
                              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                            >
                              {task.workspace?.icon ? `${task.workspace.icon} ` : ""}{task.workspace?.name}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                            {status.icon}{status.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${priority.className}`}>
                            {priority.icon}{priority.label}
                          </span>
                        </TableCell>
                        <TableCell className="pr-4">
                          {task.dueDate !== undefined ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="size-3.5 shrink-0" />
                              {formatDueShort(task.dueDate)}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <RecentActivityCard limit={7} />
        </div>
      </div>
    </div>
  )
}
