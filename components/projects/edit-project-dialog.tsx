"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"
import { useMutation } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProjectInformations } from "@/components/new-project-dialog/project-informations"
import { ACCENT_COLORS, ICONS } from "@/components/new-project-dialog/constants"

interface ProjectInput {
  _id: Id<"workspaces">
  name: string
  description?: string
  color?: string
  icon?: string
}

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectInput | null
}

export function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const updateProject = useMutation(api.projects.update)

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [accent, setAccent] = React.useState<string>(ACCENT_COLORS[0].id)
  const [icon, setIcon] = React.useState<string>(ICONS[0])
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!project) return
    setName(project.name)
    setDescription(project.description ?? "")
    setAccent(project.color ?? ACCENT_COLORS[0].id)
    setIcon(project.icon ?? ICONS[0])
  }, [project])

  function handleClose() {
    onOpenChange(false)
  }

  const canSubmit = !!project && name.trim().length > 0 && !submitting

  async function handleSubmit() {
    if (!canSubmit || !project) return
    setSubmitting(true)
    try {
      await updateProject({
        id: project._id,
        name: name.trim(),
        description: description.trim() || undefined,
        color: accent,
        icon,
      })
      toast.success("Projekt zaktualizowany")
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zaktualizować projektu")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-lg flex-col gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            Edytuj projekt
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        <div className="px-6 py-5">
          <ProjectInformations
            name={name} setName={setName}
            description={description} setDescription={setDescription}
            accent={accent} setAccent={setAccent}
            icon={icon} setIcon={setIcon}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/50 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            Anuluj
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            {submitting ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
