"use client"

import { Plus } from "lucide-react"
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

interface ListViewProps {
  tasks: Task[]
  onEditTask: (id: Id<"tasks">) => void
  onCreateTask: () => void
  hasBoards: boolean
}

export function ListView({ tasks, onEditTask, onCreateTask, hasBoards }: ListViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Zadania</h2>
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
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
          {hasBoards ? "Brak zadań. Utwórz pierwsze." : "Najpierw potrzebna jest tablica."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <TaskRow key={t._id} task={t} onEdit={() => onEditTask(t._id)} />
          ))}
        </div>
      )}
    </div>
  )
}
