"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Status = "todo" | "inprogress" | "review" | "done"
type Priority = "low" | "medium" | "high" | "urgent"

const STATUS_OPTIONS: { id: Status; label: string }[] = [
  { id: "todo",       label: "Do zrobienia" },
  { id: "inprogress", label: "W toku" },
  { id: "review",     label: "Do przeglądu" },
  { id: "done",       label: "Gotowe" },
]

const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
  { id: "low",    label: "Niski" },
  { id: "medium", label: "Średni" },
  { id: "high",   label: "Wysoki" },
  { id: "urgent", label: "Krytyczny" },
]

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultWorkspaceId?: Id<"workspaces">
}

export function CreateTaskDialog({ open, onOpenChange, defaultWorkspaceId }: CreateTaskDialogProps) {
  const projects = useQuery(api.projects.list)
  const createTask = useMutation(api.tasks.create)

  const [workspaceId, setWorkspaceId] = React.useState<string>(defaultWorkspaceId ?? "")
  const [title,       setTitle]       = React.useState("")
  const [description, setDescription] = React.useState("")
  const [boardId,     setBoardId]     = React.useState<string>("")
  const [assigneeId,  setAssigneeId]  = React.useState<string>("")
  const [status,      setStatus]      = React.useState<Status>("todo")
  const [priority,    setPriority]    = React.useState<Priority>("medium")
  const [submitting,  setSubmitting]  = React.useState(false)

  const boards = useQuery(
    api.projects.listBoards,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
  )
  const members = useQuery(
    api.projects.listMembers,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
  )

  React.useEffect(() => {
    if (open && defaultWorkspaceId && !workspaceId) {
      setWorkspaceId(defaultWorkspaceId)
    }
  }, [open, defaultWorkspaceId, workspaceId])

  React.useEffect(() => {
    if (!workspaceId && projects && projects.length > 0) {
      setWorkspaceId(projects[0]._id)
    }
  }, [projects, workspaceId])

  React.useEffect(() => {
    setBoardId("")
    setAssigneeId("")
  }, [workspaceId])

  React.useEffect(() => {
    if (boards && boards.length > 0 && !boardId) {
      setBoardId(boards[0]._id)
    }
  }, [boards, boardId])

  function reset() {
    setWorkspaceId(defaultWorkspaceId ?? "")
    setTitle("")
    setDescription("")
    setBoardId("")
    setAssigneeId("")
    setStatus("todo")
    setPriority("medium")
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  const canSubmit =
    title.trim().length > 0 && !!workspaceId && !!boardId && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await createTask({
        boardId: boardId as Id<"boards">,
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || undefined,
        status,
        priority,
      })
      toast.success("Zadanie utworzone")
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się utworzyć zadania")
    } finally {
      setSubmitting(false)
    }
  }

  const noProjects = projects && projects.length === 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-lg flex-col gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            Nowe zadanie
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {noProjects ? (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
              Najpierw utwórz projekt, aby dodawać zadania.
            </div>
          ) : (
            <>
              <Select label="Projekt" value={workspaceId} onChange={setWorkspaceId} disabled={!projects}>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>{p.icon ?? "📁"} {p.name}</option>
                ))}
              </Select>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tytuł</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Co trzeba zrobić?"
                  className="h-10"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Opis</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Szczegóły zadania (opcjonalnie)"
                  className="resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select label="Tablica" value={boardId} onChange={setBoardId} disabled={!boards || boards.length === 0}>
                  {boards && boards.length === 0 ? (
                    <option value="">Brak tablic</option>
                  ) : (
                    boards?.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))
                  )}
                </Select>
                <Select label="Przypisany" value={assigneeId} onChange={setAssigneeId} disabled={!members}>
                  <option value="">— Nikt —</option>
                  {members?.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {[m.user?.name, m.user?.surname].filter(Boolean).join(" ") || "Nieznany"}
                    </option>
                  ))}
                </Select>
                <Select label="Status" value={status} onChange={(v) => setStatus(v as Status)}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </Select>
                <Select label="Priorytet" value={priority} onChange={(v) => setPriority(v as Priority)}>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/50 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            Anuluj
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit || noProjects} className="gap-1.5">
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            {submitting ? "Tworzenie..." : "Utwórz zadanie"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}

function Select({ label, value, onChange, disabled, children }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  )
}
