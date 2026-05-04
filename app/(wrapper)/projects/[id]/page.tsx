"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { ArrowLeft, Kanban, Plus, Users } from "lucide-react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAccentGradient } from "@/components/new-project-dialog/colors"
import { TaskRow } from "@/components/projects/task-row"
import { EditTaskDialog } from "@/components/projects/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"

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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {project.name}
          </h1>
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Zadania</h2>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setCreateTaskOpen(true)}
            disabled={!hasBoards}
            title={!hasBoards ? "Najpierw potrzebna jest tablica" : undefined}
          >
            <Plus className="size-3.5" />
            Utwórz zadanie
          </Button>
        </div>
        {tasks === undefined && (
          <div className="h-24 animate-pulse rounded-xl bg-muted/50" />
        )}
        {tasks && tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
            {hasBoards ? "Brak zadań. Utwórz pierwsze." : "Najpierw potrzebna jest tablica."}
          </div>
        )}
        {tasks && tasks.length > 0 && (
          <div className="flex flex-col gap-2">
            {tasks.map((t) => (
              <TaskRow
                key={t._id}
                task={t}
                onEdit={() => setEditingTaskId(t._id)}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  )
}
