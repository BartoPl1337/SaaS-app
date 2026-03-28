"use client"

import * as React from "react"
import { Mail, Link2, Copy, Check, Shield, User, Eye } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "admin" | "member" | "viewer"

const ROLES: {
  id: Role
  label: string
  description: string
  icon: React.ReactNode
  className: string
  activeClassName: string
}[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Pełny dostęp do ustawień i zarządzania.",
    icon: <Shield className="size-4" />,
    className: "border-border/60 hover:border-violet-300 hover:bg-violet-50/50",
    activeClassName: "border-violet-400 bg-violet-50 ring-2 ring-violet-200",
  },
  {
    id: "member",
    label: "Member",
    description: "Może tworzyć zadania i edytować treść.",
    icon: <User className="size-4" />,
    className: "border-border/60 hover:border-sky-300 hover:bg-sky-50/50",
    activeClassName: "border-sky-400 bg-sky-50 ring-2 ring-sky-200",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Tylko podgląd — brak możliwości edycji.",
    icon: <Eye className="size-4" />,
    className: "border-border/60 hover:border-slate-300 hover:bg-slate-50/50",
    activeClassName: "border-slate-400 bg-slate-50 ring-2 ring-slate-200",
  },
]

const INVITE_LINK = "https://projecthub.app/invite/abc123xyz"

// ─── Component ────────────────────────────────────────────────────────────────

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<Role>("member")
  const [copied, setCopied] = React.useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(INVITE_LINK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSubmit() {
    // placeholder — handle invite logic here
    onOpenChange(false)
    setEmail("")
    setRole("member")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md gap-0 p-0">

        {/* Header */}
        <DialogHeader className="border-b border-border/50 px-6 py-5">
          <DialogTitle className="text-base font-semibold">
            Zaproś nowych członków
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Wyślij zaproszenie e-mailem lub udostępnij link — nowi członkowie
            dołączą po akceptacji.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Adres e-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="email"
                placeholder="imie@firma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          {/* Role selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-foreground">
              Przypisz rolę
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                    role === r.id ? r.activeClassName : r.className
                  }`}
                >
                  <span
                    className={`flex size-7 items-center justify-center rounded-lg ${
                      role === r.id
                        ? r.id === "admin"
                          ? "bg-violet-100 text-violet-600"
                          : r.id === "member"
                          ? "bg-sky-100 text-sky-600"
                          : "bg-slate-100 text-slate-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                      {r.description}
                    </p>
                  </div>
                  {/* Active indicator */}
                  <div
                    className={`ml-auto mt-auto flex size-4 items-center justify-center rounded-full border-2 transition-all ${
                      role === r.id
                        ? r.id === "admin"
                          ? "border-violet-500 bg-violet-500"
                          : r.id === "member"
                          ? "border-sky-500 bg-sky-500"
                          : "border-slate-500 bg-slate-500"
                        : "border-border bg-background"
                    }`}
                  >
                    {role === r.id && <Check className="size-2.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Invite link */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Link2 className="size-3.5 text-muted-foreground" />
              <label className="text-xs font-medium text-foreground">
                Udostępnij link do zaproszenia
              </label>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {INVITE_LINK}
              </span>
              <button
                onClick={handleCopy}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  copied
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-background text-foreground shadow-xs hover:bg-muted"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="size-3" />
                    Skopiowano
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    Kopiuj
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              Link jest ważny przez 7 dni i może zostać użyty tylko raz.
            </p>
          </div>

        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/50 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            disabled={!email.trim()}
            onClick={handleSubmit}
          >
            <Mail className="size-3.5" />
            Wyślij zaproszenie
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
