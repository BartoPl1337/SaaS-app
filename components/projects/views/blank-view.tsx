"use client"

import { Boxes, Plus } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { TaskRow } from "@/components/projects/task-row"

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"

interface User { name?: string; surname?: string; email?: string }
interface Task {
  _id: Id<"tasks">
  title: string
  description?: string
  status: Status
  priority: Priority
  board: { name: string } | null
  assignee: User | null
}

interface BlankViewProps {
  tasks: Task[]
  onEditTask: (id: Id<"tasks">) => void
  onCreateTask: () => void
  hasBoards: boolean
}

export function BlankView({ tasks, onEditTask, onCreateTask, hasBoards }: BlankViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Boxes className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">Pusty projekt</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Zacznij od dodania pierwszego zadania. Strukturę zbudujesz po swojemu.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={onCreateTask}
          disabled={!hasBoards}
          title={!hasBoards ? "Najpierw potrzebna jest tablica" : undefined}
        >
          <Plus className="size-3.5" /> Utwórz zadanie
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Zadania</h2>
        <Button size="sm" className="gap-1.5" onClick={onCreateTask} disabled={!hasBoards}>
          <Plus className="size-3.5" /> Utwórz zadanie
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskRow key={t._id} task={t} onEdit={() => onEditTask(t._id)} />
        ))}
      </div>
    </div>
  )
}
