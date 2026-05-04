"use client"

import * as React from "react"
import { Crown, Plus, UserPlus, X } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { AddMemberDialog } from "./add-member-dialog"

const ROLE_LABEL: Record<string, string> = {
  owner: "Właściciel",
  member: "Członek",
  viewer: "Obserwator",
}

interface ProjectMembersSectionProps {
  workspaceId: Id<"workspaces">
  isOwner: boolean
}

function initialsOf(user: { name?: string; surname?: string; email?: string }) {
  const a = user.name?.[0] ?? ""
  const b = user.surname?.[0] ?? ""
  const out = (a + b).toUpperCase()
  return out || user.email?.[0]?.toUpperCase() || "?"
}

export function ProjectMembersSection({ workspaceId, isOwner }: ProjectMembersSectionProps) {
  const members = useQuery(api.projects.listMembers, { workspaceId })
  const removeMember = useMutation(api.projects.removeMember)

  const [addOpen, setAddOpen] = React.useState(false)
  const [removingId, setRemovingId] = React.useState<Id<"workspaceMembers"> | null>(null)

  async function handleRemove(membershipId: Id<"workspaceMembers">, name: string) {
    if (!window.confirm(`Usunąć ${name} z projektu?`)) return
    setRemovingId(membershipId)
    try {
      await removeMember({ membershipId })
      toast.success("Członek usunięty")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się usunąć członka")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Członkowie</h2>
        {isOwner && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            Dodaj członka
          </Button>
        )}
      </div>

      {members === undefined && (
        <div className="h-20 animate-pulse rounded-xl bg-muted/50" />
      )}

      {members && members.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 px-6 py-8 text-center">
          <UserPlus className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Brak członków w tym projekcie.</p>
        </div>
      )}

      {members && members.length > 0 && (
        <div className="flex flex-col gap-2">
          {members.map((m) => {
            const user = m.user ?? {}
            const fullName =
              [user.name, user.surname].filter(Boolean).join(" ") ||
              user.email ||
              "Nieznany użytkownik"
            const isMemberOwner = m.role === "owner"
            const canRemove = isOwner && !isMemberOwner

            return (
              <div
                key={m._id}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                  {initialsOf(user)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {fullName}
                    {isMemberOwner && (
                      <Crown className="size-3 text-amber-500" />
                    )}
                  </p>
                  {user.email && (
                    <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {ROLE_LABEL[m.role] ?? m.role}
                </span>
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(m._id, fullName)}
                    disabled={removingId === m._id}
                    className="size-7 text-muted-foreground hover:text-rose-600"
                    aria-label="Usuń członka"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} workspaceId={workspaceId} />
    </div>
  )
}
