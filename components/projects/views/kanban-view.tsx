"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useMutation } from "convex/react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { TaskCard } from "./task-card"

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"

interface User { name?: string; surname?: string; email?: string }
interface Task {
  _id: Id<"tasks">
  title: string
  description?: string
  status: Status
  priority: Priority
  order: number
  assignee: User | null
}

const COLUMNS: { id: Status; label: string; accent: string }[] = [
  { id: "todo",       label: "Do zrobienia", accent: "bg-slate-400" },
  { id: "inprogress", label: "W toku",       accent: "bg-sky-500"   },
  { id: "review",     label: "Do przeglądu", accent: "bg-amber-500" },
  { id: "done",       label: "Gotowe",       accent: "bg-emerald-500" },
]

interface KanbanViewProps {
  tasks: Task[]
  onEditTask: (id: Id<"tasks">) => void
  onCreateTask: () => void
  hasBoards: boolean
}

export function KanbanView({ tasks, onEditTask, onCreateTask, hasBoards }: KanbanViewProps) {
  const moveToStatus = useMutation(api.tasks.moveToStatus)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const [activeId, setActiveId] = useState<Id<"tasks"> | null>(null)

  const grouped: Record<Status, Task[]> = {
    todo: [], inprogress: [], review: [], done: [],
  }
  for (const t of tasks) grouped[t.status].push(t)
  for (const k of Object.keys(grouped) as Status[]) {
    grouped[k].sort((a, b) => a.order - b.order)
  }

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) ?? null : null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as Id<"tasks">)
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    if (!e.over) return
    const taskId = e.active.id as Id<"tasks">
    const targetStatus = e.over.id as Status
    const task = tasks.find((t) => t._id === taskId)
    if (!task || task.status === targetStatus) return
    const last = grouped[targetStatus].at(-1)
    const newOrder = last ? last.order + 1 : 0
    try {
      await moveToStatus({ id: taskId, status: targetStatus, order: newOrder })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się przenieść zadania")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Tablica</h2>
        <Button size="sm" className="gap-1.5" onClick={onCreateTask} disabled={!hasBoards} title={!hasBoards ? "Najpierw potrzebna jest tablica" : undefined}>
          <Plus className="size-3.5" /> Utwórz zadanie
        </Button>
      </div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((c) => (
            <Column
              key={c.id}
              status={c.id}
              label={c.label}
              accent={c.accent}
              tasks={grouped[c.id]}
              onEditTask={onEditTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <TaskCard
              title={activeTask.title}
              description={activeTask.description}
              priority={activeTask.priority}
              assignee={activeTask.assignee}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

interface ColumnProps {
  status: Status
  label: string
  accent: string
  tasks: Task[]
  onEditTask: (id: Id<"tasks">) => void
}

function Column({ status, label, accent, tasks, onEditTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 rounded-xl border p-3 transition-colors ${
        isOver ? "border-foreground/30 bg-muted/50" : "border-border/60 bg-muted/20"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${accent}`} />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex min-h-24 flex-col gap-2">
        {tasks.map((t) => (
          <DraggableTask key={t._id} task={t} onEdit={() => onEditTask(t._id)} />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/60 text-[11px] text-muted-foreground">
            Upuść zadanie
          </div>
        )}
      </div>
    </div>
  )
}

function DraggableTask({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task._id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <TaskCard
        title={task.title}
        description={task.description}
        priority={task.priority}
        assignee={task.assignee}
        dragging={isDragging}
        onEdit={onEdit}
      />
    </div>
  )
}
