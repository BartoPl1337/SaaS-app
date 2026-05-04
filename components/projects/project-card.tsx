"use client"

import Link from "next/link"
import type { Doc } from "@/convex/_generated/dataModel"
import { getAccentGradient } from "@/components/new-project-dialog/colors"

interface ProjectCardProps {
  project: Doc<"workspaces">
}

export function ProjectCard({ project }: ProjectCardProps) {
  const gradient = getAccentGradient(project.color)

  return (
    <Link
      href={`/projects/${project._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-md"
    >
      <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${gradient}`}>
        <span className="text-4xl drop-shadow-sm">{project.icon ?? "🚀"}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 min-h-8">
          {project.description ?? "Brak opisu"}
        </p>
      </div>
    </Link>
  )
}
