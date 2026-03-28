"use client"

import * as React from "react"
import {
  UserPlus,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  Shield,
  Code2,
  Palette,
  BarChart3,
  Megaphone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { InviteMemberDialog } from "@/components/invite-member-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "Admin" | "Developer" | "Designer" | "Analyst" | "Marketing"
type Status = "Aktywny" | "Nieaktywny" | "Zaproszony"

interface Member {
  id: number
  name: string
  email: string
  initials: string
  color: string
  role: Role
  status: Status
  joinedAt: string
  lastSeen: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: 1,  name: "Bartosz Brodziak",   email: "bartosz@xyz.com",   initials: "BB", color: "from-violet-500 to-indigo-600",  role: "Admin",     status: "Aktywny",    joinedAt: "1 sty 2025",  lastSeen: "teraz" },
  { id: 2,  name: "Karolina Nowak",     email: "karolina@xyz.com",  initials: "KN", color: "from-sky-500 to-cyan-600",       role: "Developer", status: "Aktywny",    joinedAt: "14 sty 2025", lastSeen: "5 min temu" },
  { id: 3,  name: "Marcin Kowalski",    email: "marcin@xyz.com",    initials: "MK", color: "from-amber-500 to-orange-600",   role: "Developer", status: "Aktywny",    joinedAt: "20 sty 2025", lastSeen: "1 godz. temu" },
  { id: 4,  name: "Anna Nowak",         email: "anna@xyz.com",      initials: "AN", color: "from-rose-500 to-pink-600",      role: "Designer",  status: "Aktywny",    joinedAt: "3 lut 2025",  lastSeen: "3 godz. temu" },
  { id: 5,  name: "Tomasz Wiśniewski",  email: "tomasz@xyz.com",    initials: "TW", color: "from-emerald-500 to-teal-600",   role: "Developer", status: "Aktywny",    joinedAt: "10 lut 2025", lastSeen: "wczoraj" },
  { id: 6,  name: "Julia Kowalczyk",    email: "julia@xyz.com",     initials: "JK", color: "from-fuchsia-500 to-purple-600", role: "Marketing", status: "Aktywny",    joinedAt: "1 mar 2025",  lastSeen: "2 dni temu" },
  { id: 7,  name: "Piotr Zając",        email: "piotr@xyz.com",     initials: "PZ", color: "from-lime-500 to-green-600",     role: "Analyst",   status: "Nieaktywny", joinedAt: "15 mar 2025", lastSeen: "2 tyg. temu" },
  { id: 8,  name: "Marta Lewandowska",  email: "marta@xyz.com",     initials: "ML", color: "from-orange-500 to-red-600",     role: "Designer",  status: "Nieaktywny", joinedAt: "22 mar 2025", lastSeen: "miesiąc temu" },
  { id: 9,  name: "Krzysztof Dąbrowski",email: "krzys@xyz.com",     initials: "KD", color: "from-cyan-500 to-blue-600",      role: "Developer", status: "Zaproszony", joinedAt: "—",           lastSeen: "—" },
  { id: 10, name: "Zofia Wójcik",       email: "zofia@xyz.com",     initials: "ZW", color: "from-pink-500 to-rose-600",      role: "Marketing", status: "Zaproszony", joinedAt: "—",           lastSeen: "—" },
  { id: 11, name: "Adam Lewicki",        email: "adam@xyz.com",      initials: "AL", color: "from-teal-500 to-emerald-600",   role: "Analyst",   status: "Zaproszony", joinedAt: "—",           lastSeen: "—" },
]

const ROLE_CONFIG: Record<Role, { icon: React.ReactNode; className: string }> = {
  Admin:     { icon: <Shield   className="size-3" />, className: "bg-violet-50 text-violet-700 border-violet-200" },
  Developer: { icon: <Code2    className="size-3" />, className: "bg-sky-50 text-sky-700 border-sky-200" },
  Designer:  { icon: <Palette  className="size-3" />, className: "bg-pink-50 text-pink-700 border-pink-200" },
  Analyst:   { icon: <BarChart3 className="size-3" />, className: "bg-amber-50 text-amber-700 border-amber-200" },
  Marketing: { icon: <Megaphone className="size-3" />, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}

const STATUS_CONFIG: Record<Status, { className: string; dot: string }> = {
  Aktywny:    { className: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  Nieaktywny: { className: "text-slate-500 bg-slate-50 border-slate-200",       dot: "bg-slate-400" },
  Zaproszony: { className: "text-amber-600 bg-amber-50 border-amber-200",       dot: "bg-amber-400" },
}

const PAGE_SIZE = 5

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  trend?: { value: number; positive: boolean }
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
        {(sub || trend) && (
          <div className="mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  trend.positive ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {trend.positive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {trend.value}%
              </span>
            )}
            {sub && (
              <span className="text-xs text-muted-foreground">{sub}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const [page, setPage] = React.useState(1)
  const [inviteOpen, setInviteOpen] = React.useState(false)

  const totalMembers  = MEMBERS.filter((m) => m.status !== "Zaproszony").length
  const activeNow     = MEMBERS.filter((m) => m.lastSeen === "teraz" || m.lastSeen.includes("min")).length
  const pendingInvites = MEMBERS.filter((m) => m.status === "Zaproszony").length

  const totalPages = Math.ceil(MEMBERS.length / PAGE_SIZE)
  const paginated  = MEMBERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Członkowie zespołu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj dostępem i rolami wszystkich członków obszaru roboczego.
          </p>
        </div>
        <Button size="sm" className="h-8 shrink-0 gap-1.5" onClick={() => setInviteOpen(true)}>
          <UserPlus className="size-3.5" />
          Zaproś członka
        </Button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="size-4" />}
          label="Razem członków"
          value={totalMembers}
          trend={{ value: 12, positive: false }}
          sub="mniej niż w zeszłym miesiącu"
        />
        <StatCard
          icon={<Wifi className="size-4" />}
          label="Aktywni teraz"
          value={activeNow}
          sub={`z ${totalMembers} członków online`}
        />
        <StatCard
          icon={<MailOpen className="size-4" />}
          label="Oczekujące zaproszenia"
          value={pendingInvites}
          sub="czeka na akceptację"
        />
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs">

        {/* Table header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
          <p className="text-sm font-semibold text-foreground">
            Wszyscy członkowie
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({MEMBERS.length})
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, MEMBERS.length)} z {MEMBERS.length}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="pl-5 text-xs font-medium text-muted-foreground">
                Użytkownik
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Rola
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="pr-5 text-xs font-medium text-muted-foreground">
                Data dołączenia
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((member) => {
              const role   = ROLE_CONFIG[member.role]
              const status = STATUS_CONFIG[member.status]
              return (
                <TableRow
                  key={member.id}
                  className="cursor-pointer border-border/40 hover:bg-muted/30"
                >
                  {/* Avatar + name + email */}
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-[11px] font-bold text-white`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${role.className}`}
                    >
                      {role.icon}
                      {member.role}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${status.dot} ${
                          member.status === "Aktywny" ? "animate-pulse" : ""
                        }`}
                      />
                      {member.status}
                      {member.status === "Aktywny" && (
                        <span className="text-[10px] text-muted-foreground">
                          · {member.lastSeen}
                        </span>
                      )}
                    </span>
                  </TableCell>

                  {/* Join date */}
                  <TableCell className="pr-5 text-sm text-muted-foreground">
                    {member.joinedAt}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Strona {page} z {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              className="size-7"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
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
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>

      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
