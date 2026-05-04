"use client"

import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MEMBERS_POOL } from "./constants"
import type { InvitedMember, Role } from "./types"

interface ProjectMembersProps {
  members: InvitedMember[]
  setMembers: (v: InvitedMember[]) => void
}

const ROLES: Role[] = ["Admin", "Member", "Viewer"]

export function ProjectMembers({ members, setMembers }: ProjectMembersProps) {
  const available = MEMBERS_POOL.filter(p => !members.find(m => m.initials === p.initials))

  function addMember(person: typeof MEMBERS_POOL[0]) {
    setMembers([...members, { ...person, role: "Member" }])
  }

  function removeMember(initials: string) {
    setMembers(members.filter(m => m.initials !== initials))
  }

  function setRole(initials: string, role: Role) {
    setMembers(members.map(m => m.initials === initials ? { ...m, role } : m))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Dodaj członków którzy będą pracować w tym projekcie. Możesz to zrobić też później.
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">Właściciel</p>
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white">
            BB
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Bartosz Brodziak</p>
            <p className="text-xs text-muted-foreground">bartosz@xyz.com</p>
          </div>
          <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px]">Admin</Badge>
        </div>
      </div>

      {members.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Zaproszeni ({members.length})</p>
          <div className="flex flex-col gap-1.5">
            {members.map(m => (
              <div key={m.initials} className="flex items-center gap-3 rounded-xl border border-border/50 px-4 py-2.5">
                <div className={`flex size-7 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-[10px] font-bold text-white`}>
                  {m.initials}
                </div>
                <p className="flex-1 text-sm font-medium text-foreground">{m.name}</p>
                <select
                  value={m.role}
                  onChange={e => setRole(m.initials, e.target.value as Role)}
                  className="h-7 rounded-lg border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  onClick={() => removeMember(m.initials)}
                  className="text-muted-foreground/50 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Dodaj z zespołu</p>
          <div className="flex flex-wrap gap-2">
            {available.map(p => (
              <button
                key={p.initials}
                onClick={() => addMember(p)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-muted/40 hover:text-foreground"
              >
                <div className={`flex size-5 items-center justify-center rounded-full bg-gradient-to-br ${p.color} text-[9px] font-bold text-white`}>
                  {p.initials}
                </div>
                {p.name.split(" ")[0]}
                <Plus className="size-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
