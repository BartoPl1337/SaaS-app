"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"
import { useMutation } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Role = "member" | "viewer"

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: "member", label: "Członek" },
  { id: "viewer", label: "Obserwator" },
]

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: Id<"workspaces">
}

export function AddMemberDialog({ open, onOpenChange, workspaceId }: AddMemberDialogProps) {
  const addMember = useMutation(api.projects.addMember)

  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<Role>("member")
  const [submitting, setSubmitting] = React.useState(false)

  function reset() {
    setEmail("")
    setRole("member")
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  const canSubmit = email.trim().length > 0 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await addMember({ workspaceId, email: email.trim(), role })
      toast.success("Członek dodany")
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się dodać członka")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-md flex-col gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            Dodaj członka
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email użytkownika</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
              placeholder="osoba@example.com"
              className="h-10"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Rola</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/50 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            Anuluj
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            {submitting ? "Dodawanie..." : "Dodaj"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
