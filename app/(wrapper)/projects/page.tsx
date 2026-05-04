"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { Boxes, Plus } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const projects = useQuery(api.projects.list)

  const isLoading = projects === undefined
  const isEmpty = projects && projects.length === 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projekty</h1>
          <p className="text-sm text-muted-foreground">
            Wszystkie projekty, do których należysz.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Nowy projekt
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Boxes className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">Brak projektów</h2>
            <p className="text-sm text-muted-foreground">
              Utwórz swój pierwszy projekt aby zacząć pracę.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Nowy projekt
          </Button>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
