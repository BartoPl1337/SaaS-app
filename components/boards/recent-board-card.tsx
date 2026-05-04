"use client"

import Link from "next/link"
import { Clock, Users } from "lucide-react"
import { getAccentGradient } from "@/components/new-project-dialog/colors"

interface RecentBoard {
  _id: string
  _creationTime: number
  name: string
  workspace: { _id: string; name: string; color?: string; icon?: string } | null
  taskCount: number
  doneCount: number
  memberCount: number
}

function formatRelative(ms: number) {
  const diff = Date.now() - ms
  const min = Math.round(diff / 60_000)
  if (min < 1) return "przed chwilą"
  if (min < 60) return `${min} min temu`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} godz. temu`
  const day = Math.round(hr / 24)
  if (day === 1) return "wczoraj"
  if (day < 7) return `${day} dni temu`
  const wk = Math.round(day / 7)
  if (wk < 4) return `${wk} tyg. temu`
  return new Date(ms).toLocaleDateString("pl-PL")
}

export function RecentBoardCard({ board }: { board: RecentBoard }) {
  const gradient = getAccentGradient(board.workspace?.color)
  const pct = board.taskCount === 0
    ? 0
    : Math.round((board.doneCount / board.taskCount) * 100)

  const href = board.workspace ? `/projects/${board.workspace._id}` : "#"

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-sm`}>
          {board.workspace?.icon ?? "📋"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{board.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {board.workspace?.name ?? "Brak projektu"}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{board.doneCount}/{board.taskCount} zadań</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="size-3" />
          {board.memberCount} {board.memberCount === 1 ? "członek" : "członków"}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          {formatRelative(board._creationTime)}
        </div>
      </div>
    </Link>
  )
}
