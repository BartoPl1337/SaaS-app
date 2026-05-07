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
import { useMutation, useQuery } from "convex/react"
import { CheckCircle2, Flag, Plus, PlayCircle } from "lucide-react"
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
  sprintId?: Id<"sprints">
  assignee: User | null
}

interface ScrumViewProps {
  workspaceId: Id<"workspaces">
  tasks: Task[]
  onEditTask: (id: Id<"tasks">) => void
  onCreateTask: () => void
  hasBoards: boolean
}

const BACKLOG_ID = "backlog"

export function ScrumView({ workspaceId, tasks, onEditTask, onCreateTask, hasBoards }: ScrumViewProps) {
  const sprints = useQuery(api.sprints.list, { workspaceId })
  const moveToSprint = useMutation(api.tasks.moveToSprint)
  const createSprint = useMutation(api.sprints.create)
  const startSprint = useMutation(api.sprints.start)
  const completeSprint = useMutation(api.sprints.complete)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const [activeId, setActiveId] = useState<Id<"tasks"> | null>(null)
  const [creating, setCreating] = useState(false)

  if (sprints === undefined) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
  }

  const sprintsList = sprints
  const activeSprints = sprintsList.filter((s) => s.status === "active")
  const plannedSprints = sprintsList.filter((s) => s.status === "planned")
  const visibleSprints = [...activeSprints, ...plannedSprints]
  const sprintIds = new Set(visibleSprints.map((s) => s._id))

  const backlog = tasks.filter((t) => !t.sprintId || !sprintIds.has(t.sprintId))
  const tasksBySprint = new Map<Id<"sprints">, Task[]>()
  for (const s of visibleSprints) tasksBySprint.set(s._id, [])
  for (const t of tasks) {
    if (t.sprintId && sprintIds.has(t.sprintId)) {
      tasksBySprint.get(t.sprintId)!.push(t)
    }
  }

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) ?? null : null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as Id<"tasks">)
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    if (!e.over) return
    const taskId = e.active.id as Id<"tasks">
    const target = e.over.id as string
    const task = tasks.find((t) => t._id === taskId)
    if (!task) return

    try {
      if (target === BACKLOG_ID) {
        if (!task.sprintId) return
        await moveToSprint({ id: taskId, sprintId: null })
      } else {
        const sprintId = target as Id<"sprints">
        if (task.sprintId === sprintId) return
        await moveToSprint({ id: taskId, sprintId })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się przenieść zadania")
    }
  }

  async function handleCreateSprint() {
    if (creating) return
    setCreating(true)
    try {
      const next = sprintsList.length + 1
      await createSprint({ workspaceId, name: `Sprint ${next}` })
      toast.success("Sprint utworzony")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się utworzyć sprintu")
    } finally {
      setCreating(false)
    }
  }

  async function handleStart(id: Id<"sprints">) {
    try {
      await startSprint({ id })
      toast.success("Sprint rozpoczęty")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się rozpocząć")
    }
  }

  async function handleComplete(id: Id<"sprints">) {
    try {
      await completeSprint({ id })
      toast.success("Sprint zakończony")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zakończyć")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Scrum</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCreateSprint} disabled={creating}>
            <Plus className="size-3.5" /> Nowy sprint
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onCreateTask} disabled={!hasBoards} title={!hasBoards ? "Najpierw potrzebna jest tablica" : undefined}>
            <Plus className="size-3.5" /> Utwórz zadanie
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4">
          {visibleSprints.map((s) => {
            const sprintTasks = tasksBySprint.get(s._id) ?? []
            const done = sprintTasks.filter((t) => t.status === "done").length
            return (
              <Section
                key={s._id}
                droppableId={s._id}
                accent={s.status === "active" ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-500/5" : "border-border/60"}
                header={
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Flag className={`size-3.5 ${s.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold text-foreground">{s.name}</span>
                      {s.status === "active" && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">aktywny</span>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {done}/{sprintTasks.length}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {s.status === "planned" && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => handleStart(s._id)}>
                          <PlayCircle className="size-3.5" /> Rozpocznij
                        </Button>
                      )}
                      {s.status === "active" && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => handleComplete(s._id)}>
                          <CheckCircle2 className="size-3.5" /> Zakończ
                        </Button>
                      )}
                    </div>
                  </div>
                }
                tasks={sprintTasks}
                onEditTask={onEditTask}
                emptyHint="Przeciągnij zadanie z backlogu"
              />
            )
          })}

          <Section
            droppableId={BACKLOG_ID}
            accent="border-border/60"
            header={
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Backlog</span>
                <span className="text-[11px] text-muted-foreground">{backlog.length}</span>
              </div>
            }
            tasks={backlog}
            onEditTask={onEditTask}
            emptyHint="Brak zadań w backlogu"
          />
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

interface SectionProps {
  droppableId: string
  header: React.ReactNode
  accent: string
  tasks: Task[]
  emptyHint: string
  onEditTask: (id: Id<"tasks">) => void
}

function Section({ droppableId, header, accent, tasks, emptyHint, onEditTask }: SectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors ${accent} ${
        isOver ? "ring-2 ring-foreground/20" : ""
      }`}
    >
      {header}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((t) => (
          <DraggableTask key={t._id} task={t} onEdit={() => onEditTask(t._id)} />
        ))}
      </div>
      {tasks.length === 0 && (
        <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border/60 text-[11px] text-muted-foreground">
          {emptyHint}
        </div>
      )}
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
