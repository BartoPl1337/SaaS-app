"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddMemberDialog } from "@/components/projects/add-member-dialog"

type Role = "owner" | "member" | "viewer"

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; className: string }> = {
  owner:  { label: "Właściciel", icon: <Shield className="size-3" />, className: "bg-violet-50 text-violet-700 border-violet-200" },
  member: { label: "Członek",    icon: <User   className="size-3" />, className: "bg-sky-50 text-sky-700 border-sky-200" },
  viewer: { label: "Obserwator", icon: <Eye    className="size-3" />, className: "bg-slate-50 text-slate-600 border-slate-200" },
}

const PL_MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]

function formatJoined(ts: number): string {
  const d = new Date(ts)
  return `${d.getDate()} ${PL_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function initialsOf(user: { name?: string; surname?: string; email?: string } | null | undefined): string {
  if (!user) return "?"
  const a = user.name?.[0] ?? ""
  const b = user.surname?.[0] ?? ""
  const out = (a + b).toUpperCase()
  return out || user.email?.[0]?.toUpperCase() || "?"
}

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
]

function gradientFor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

const PAGE_SIZE = 8

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

export default function MembersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectParam = searchParams.get("project")

  const projects = useQuery(api.projects.list)
  const removeMember = useMutation(api.projects.removeMember)

  const selectedId = React.useMemo<Id<"workspaces"> | null>(() => {
    if (!projects || projects.length === 0) return null
    const found = projectParam && projects.find((p) => p._id === projectParam)
    if (found) return found._id as Id<"workspaces">
    return projects[0]._id as Id<"workspaces">
  }, [projects, projectParam])

  const selectedProject = projects?.find((p) => p._id === selectedId) ?? null

  const members = useQuery(
    api.projects.listMembers,
    selectedId ? { workspaceId: selectedId } : "skip",
  )

  const project = useQuery(
    api.projects.get,
    selectedId ? { id: selectedId } : "skip",
  )
  const isOwner = project?.viewerRole === "owner"

  const [page, setPage] = React.useState(1)
  const [addOpen, setAddOpen] = React.useState(false)
  const [removingId, setRemovingId] = React.useState<Id<"workspaceMembers"> | null>(null)

  React.useEffect(() => {
    setPage(1)
  }, [selectedId])

  function selectProject(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("project", id)
    router.replace(`/members?${params.toString()}`)
  }

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

  const totalMembers = members?.length ?? 0
  const ownersCount = (members ?? []).filter((m) => m.role === "owner").length
  const viewersCount = (members ?? []).filter((m) => m.role === "viewer").length

  const totalPages = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = (members ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ─── No projects ──────────────────────────────────────────────────────────
  if (projects && projects.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Członkowie zespołu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj dostępem i rolami członków projektu.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border/60 px-6 py-16 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnych projektów. Utwórz projekt, aby zarządzać członkami.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {selectedProject ? `Członkowie — ${selectedProject.name}` : "Członkowie zespołu"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj dostępem i rolami członków projektu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2" disabled={!projects}>
                {selectedProject ? (
                  <>
                    <span>{selectedProject.icon ?? "📁"}</span>
                    <span className="max-w-[180px] truncate">{selectedProject.name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Wybierz projekt</span>
                )}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs">Projekt</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects?.map((p) => (
                <DropdownMenuItem
                  key={p._id}
                  className="gap-2 text-sm"
                  onClick={() => selectProject(p._id)}
                >
                  <span>{p.icon ?? "📁"}</span>
                  <span className="truncate">{p.name}</span>
                  {p._id === selectedId && (
                    <CheckCheck className="ml-auto size-3.5 text-emerald-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isOwner && (
            <Button size="sm" className="h-8 shrink-0 gap-1.5" onClick={() => setAddOpen(true)}>
              <UserPlus className="size-3.5" />
              Dodaj członka
            </Button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="size-4" />}
          label="Razem członków"
          value={members === undefined ? "—" : totalMembers}
          sub="w tym projekcie"
        />
        <StatCard
          icon={<Shield className="size-4" />}
          label="Właściciele"
          value={members === undefined ? "—" : ownersCount}
          sub="z prawami do zarządzania"
        />
        <StatCard
          icon={<Eye className="size-4" />}
          label="Obserwatorzy"
          value={members === undefined ? "—" : viewersCount}
          sub="tylko podgląd"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
          <p className="text-sm font-semibold text-foreground">
            Wszyscy członkowie
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({totalMembers})
            </span>
          </p>
          {totalMembers > 0 && (
            <p className="text-xs text-muted-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalMembers)} z {totalMembers}
            </p>
          )}
        </div>

        {members === undefined && (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted/50" />
            ))}
          </div>
        )}

        {members && members.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            Brak członków w tym projekcie.
          </div>
        )}

        {members && members.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="pl-5 text-xs font-medium text-muted-foreground">Użytkownik</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Rola</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Data dołączenia</TableHead>
                <TableHead className="pr-5 text-right text-xs font-medium text-muted-foreground">Akcje</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((m) => {
                const role = ROLE_CONFIG[m.role as Role] ?? ROLE_CONFIG.member
                const user = m.user ?? null
                const fullName =
                  [user?.name, user?.surname].filter(Boolean).join(" ") ||
                  user?.email ||
                  "Nieznany użytkownik"
                const isMemberOwner = m.role === "owner"
                const canRemove = isOwner && !isMemberOwner

                return (
                  <TableRow key={m._id} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(m.userId)} text-[11px] font-bold text-white`}
                        >
                          {initialsOf(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                            {fullName}
                            {isMemberOwner && <Crown className="size-3 text-amber-500" />}
                          </p>
                          {user?.email && (
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${role.className}`}>
                        {role.icon}
                        {role.label}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {formatJoined(m._creationTime)}
                    </TableCell>

                    <TableCell className="pr-5 text-right">
                      {canRemove ? (
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
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalMembers > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Strona {safePage} z {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                className="size-7"
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === safePage ? "default" : "ghost"}
                  size="icon-sm"
                  className="size-7 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon-sm"
                className="size-7"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <AddMemberDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          workspaceId={selectedId}
        />
      )}
    </div>
  )
}
