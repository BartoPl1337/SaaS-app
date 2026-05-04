"use client"

import * as React from "react"
import { Loader2, Trash2, X } from "lucide-react"
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

interface TaskInput {
  _id: Id<"tasks">
  title: string
  description?: string
  assigneeId?: string
  status: Status
  priority: Priority
  dueDate?: number
  board: { _id: Id<"boards">; workspaceId: Id<"workspaces">; name: string } | null
}

function dueToInput(ms?: number): string {
  if (!ms) return ""
  const d = new Date(ms)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function parseDueDate(value: string): number | null {
  if (!value) return null
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d).getTime()
}

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: TaskInput | null
}

export function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  const updateTask = useMutation(api.tasks.update)
  const removeTask = useMutation(api.tasks.remove)

  const [title,       setTitle]       = React.useState("")
  const [description, setDescription] = React.useState("")
  const [assigneeId,  setAssigneeId]  = React.useState<string>("")
  const [status,      setStatus]      = React.useState<Status>("todo")
  const [priority,    setPriority]    = React.useState<Priority>("medium")
  const [dueDate,     setDueDate]     = React.useState<string>("")
  const [submitting,  setSubmitting]  = React.useState(false)
  const [deleting,    setDeleting]    = React.useState(false)

  const members = useQuery(
    api.projects.listMembers,
    task?.board ? { workspaceId: task.board.workspaceId } : "skip",
  )

  React.useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? "")
    setAssigneeId(task.assigneeId ?? "")
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(dueToInput(task.dueDate))
  }, [task])

  function handleClose() {
    onOpenChange(false)
  }

  const canSubmit = !!task && title.trim().length > 0 && !submitting && !deleting

  async function handleSubmit() {
    if (!canSubmit || !task) return
    setSubmitting(true)
    try {
      await updateTask({
        id: task._id,
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || null,
        status,
        priority,
        dueDate: parseDueDate(dueDate),
      })
      toast.success("Zadanie zaktualizowane")
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zaktualizować zadania")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!task || deleting || submitting) return
    if (!window.confirm("Usunąć to zadanie? Operacja jest nieodwracalna.")) return
    setDeleting(true)
    try {
      await removeTask({ id: task._id })
      toast.success("Zadanie usunięte")
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się usunąć zadania")
    } finally {
      setDeleting(false)
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
            Edytuj zadanie
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {task?.board && (
            <p className="text-xs text-muted-foreground">
              Tablica: <span className="font-medium text-foreground">{task.board.name}</span>
            </p>
          )}

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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Termin</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/50 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={submitting || deleting}
            className="gap-1.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
          >
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Usuń
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting || deleting}>
              Anuluj
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
              {submitting && <Loader2 className="size-3.5 animate-spin" />}
              {submitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
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
