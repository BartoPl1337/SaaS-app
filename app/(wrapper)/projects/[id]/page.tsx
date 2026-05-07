"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { ArrowLeft, Kanban, Pencil, Users } from "lucide-react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAccentGradient } from "@/components/new-project-dialog/colors"
import { EditTaskDialog } from "@/components/projects/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { ProjectMembersSection } from "@/components/projects/project-members-section"
import { KanbanView } from "@/components/projects/views/kanban-view"
import { ScrumView } from "@/components/projects/views/scrum-view"
import { ListView } from "@/components/projects/views/list-view"
import { BlankView } from "@/components/projects/views/blank-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const projectId = id as Id<"workspaces">

  const project = useQuery(api.projects.get, { id: projectId })
  const boards  = useQuery(api.projects.listBoards, { workspaceId: projectId })
  const members = useQuery(api.projects.listMembers, { workspaceId: projectId })
  const tasks   = useQuery(api.tasks.listByProject, { workspaceId: projectId })

  const [editingTaskId, setEditingTaskId] = useState<Id<"tasks"> | null>(null)
  const editingTask = tasks?.find((t) => t._id === editingTaskId) ?? null
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const hasBoards = !!boards && boards.length > 0

  if (project === undefined) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-32 animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-44 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    )
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h2 className="text-base font-semibold text-foreground">Projekt nie istnieje</h2>
        <p className="text-sm text-muted-foreground">
          Projekt mógł zostać usunięty lub nie masz do niego dostępu.
        </p>
        <Button asChild variant="outline">
          <Link href="/projects">
            <ArrowLeft className="size-4" /> Wróć do projektów
          </Link>
        </Button>
      </div>
    )
  }

  const gradient = getAccentGradient(project.color)
  const canEdit = project.viewerRole !== "viewer"
  const isOwner = project.viewerRole === "owner"

  return (
    <div className="flex flex-col gap-6 p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-1.5 text-muted-foreground">
        <Link href="/projects">
          <ArrowLeft className="size-3.5" /> Projekty
        </Link>
      </Button>

      <div className="flex items-start gap-4 rounded-2xl border border-border/60 p-6">
        <div className={`flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-sm`}>
          {project.icon ?? "🚀"}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project.name}
            </h1>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setEditProjectOpen(true)}
              >
                <Pencil className="size-3.5" />
                Edytuj
              </Button>
            )}
          </div>
          {project.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 rounded-full">
              <Users className="size-3" />
              {members?.length ?? 0} {members?.length === 1 ? "członek" : "członków"}
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full">
              <Kanban className="size-3" />
              {boards?.length ?? 0} {boards?.length === 1 ? "tablica" : "tablic"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Tablice</h2>
        {boards === undefined && (
          <div className="h-24 animate-pulse rounded-xl bg-muted/50" />
        )}
        {boards && boards.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
            Brak tablic w tym projekcie.
          </div>
        )}
        {boards && boards.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <div
                key={b._id}
                className="flex items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Kanban className="size-4" />
                </div>
                <p className="text-sm font-medium text-foreground">{b.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectMembersSection workspaceId={projectId} isOwner={isOwner} />

      {tasks === undefined ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
      ) : (
        renderView({
          template: project.template,
          workspaceId: projectId,
          tasks,
          hasBoards,
          onEditTask: setEditingTaskId,
          onCreateTask: () => setCreateTaskOpen(true),
        })
      )}

      <EditTaskDialog
        open={editingTaskId !== null}
        onOpenChange={(o) => !o && setEditingTaskId(null)}
        task={editingTask}
      />

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        defaultWorkspaceId={projectId}
      />

      <EditProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
      />
    </div>
  )
}

type Template = "kanban" | "scrum" | "list" | "blank" | undefined
type ProjectTasks = FunctionReturnType<typeof api.tasks.listByProject>

interface RenderViewArgs {
  template: Template
  workspaceId: Id<"workspaces">
  tasks: ProjectTasks
  hasBoards: boolean
  onEditTask: (id: Id<"tasks">) => void
  onCreateTask: () => void
}

function renderView({ template, workspaceId, tasks, hasBoards, onEditTask, onCreateTask }: RenderViewArgs) {
  if (template === "kanban") {
    return (
      <KanbanView
        tasks={tasks}
        onEditTask={onEditTask}
        onCreateTask={onCreateTask}
        hasBoards={hasBoards}
      />
    )
  }
  if (template === "scrum") {
    return (
      <ScrumView
        workspaceId={workspaceId}
        tasks={tasks}
        onEditTask={onEditTask}
        onCreateTask={onCreateTask}
        hasBoards={hasBoards}
      />
    )
  }
  if (template === "blank") {
    return (
      <BlankView
        tasks={tasks}
        onEditTask={onEditTask}
        onCreateTask={onCreateTask}
        hasBoards={hasBoards}
      />
    )
  }
  return (
    <ListView
      tasks={tasks}
      onEditTask={onEditTask}
      onCreateTask={onCreateTask}
      hasBoards={hasBoards}
    />
  )
}
