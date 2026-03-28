"use client"

import * as React from "react"
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Kanban,
  List,
  LayoutGrid,
  Boxes,
  Users,
  Plus,
  Trash2,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  { id: "violet",  bg: "bg-violet-500",  ring: "ring-violet-400",  gradient: "from-violet-500 to-indigo-600" },
  { id: "sky",     bg: "bg-sky-500",     ring: "ring-sky-400",     gradient: "from-sky-500 to-cyan-600" },
  { id: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-400", gradient: "from-emerald-500 to-teal-600" },
  { id: "amber",   bg: "bg-amber-500",   ring: "ring-amber-400",   gradient: "from-amber-500 to-orange-500" },
  { id: "rose",    bg: "bg-rose-500",    ring: "ring-rose-400",    gradient: "from-rose-500 to-pink-600" },
  { id: "fuchsia", bg: "bg-fuchsia-500", ring: "ring-fuchsia-400", gradient: "from-fuchsia-500 to-purple-600" },
  { id: "slate",   bg: "bg-slate-600",   ring: "ring-slate-400",   gradient: "from-slate-600 to-slate-700" },
  { id: "teal",    bg: "bg-teal-500",    ring: "ring-teal-400",    gradient: "from-teal-500 to-cyan-600" },
]

const ICONS = ["🚀", "⚡", "🎯", "💡", "🛠", "📦", "🌿", "🔥", "🎨", "📊", "🧩", "🌐"]

const TEMPLATES = [
  {
    id: "kanban",
    name: "Kanban",
    description: "Tablica z kolumnami Do zrobienia, W toku i Gotowe. Idealna do ciągłego przepływu zadań.",
    icon: <Kanban className="size-6" />,
    color: "text-violet-600 bg-violet-50",
    tags: ["Popularne", "Wizualny"],
  },
  {
    id: "scrum",
    name: "Scrum",
    description: "Sprinty, backlog i retrospektywy. Dla zespołów pracujących w rytmie iteracji.",
    icon: <LayoutGrid className="size-6" />,
    color: "text-sky-600 bg-sky-50",
    tags: ["Sprinty"],
  },
  {
    id: "list",
    name: "Lista zadań",
    description: "Prosta, liniowa lista zadań z priorytetami i terminami. Zero rozproszenia.",
    icon: <List className="size-6" />,
    color: "text-emerald-600 bg-emerald-50",
    tags: ["Minimalistyczny"],
  },
  {
    id: "blank",
    name: "Pusty projekt",
    description: "Zacznij od zera i zbuduj własną strukturę dopasowaną do potrzeb zespołu.",
    icon: <Boxes className="size-6" />,
    color: "text-slate-600 bg-slate-100",
    tags: ["Elastyczny"],
  },
]

const MEMBERS_POOL = [
  { initials: "KN", name: "Karolina Nowak",    color: "from-sky-500 to-cyan-600" },
  { initials: "MK", name: "Marcin Kowalski",   color: "from-amber-500 to-orange-600" },
  { initials: "AN", name: "Anna Nowak",         color: "from-rose-500 to-pink-600" },
  { initials: "TW", name: "Tomasz Wiśniewski",  color: "from-emerald-500 to-teal-600" },
  { initials: "JK", name: "Julia Kowalczyk",    color: "from-fuchsia-500 to-purple-600" },
]

type Role = "Admin" | "Member" | "Viewer"

interface InvitedMember {
  initials: string
  name: string
  color: string
  role: Role
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Podstawowe info", "Szablon", "Zespół"]
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  done
                    ? "border-foreground bg-foreground text-background"
                    : active
                    ? "border-foreground bg-background text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-3.5" /> : step}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`mb-4 h-px w-16 transition-colors ${
                  step < current ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({
  name, setName,
  description, setDescription,
  accent, setAccent,
  icon, setIcon,
}: {
  name: string; setName: (v: string) => void
  description: string; setDescription: (v: string) => void
  accent: string; setAccent: (v: string) => void
  icon: string; setIcon: (v: string) => void
}) {
  const selectedAccent = ACCENT_COLORS.find(c => c.id === accent) ?? ACCENT_COLORS[0]

  return (
    <div className="flex flex-col gap-5">
      {/* Preview + name */}
      <div className="flex items-center gap-4">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedAccent.gradient} text-2xl shadow-sm`}>
          {icon}
        </div>
        <div className="flex-1">
          <Input
            placeholder="Nazwa projektu"
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-10 text-base font-semibold"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Opis projektu</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Czym zajmuje się ten projekt? Jaki jest jego cel?"
          className="resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      {/* Accent color */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Kolor akcentu</label>
        <div className="flex items-center gap-2">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setAccent(c.id)}
              className={`flex size-7 items-center justify-center rounded-full ${c.bg} transition-all ${
                accent === c.id ? `ring-2 ring-offset-2 ${c.ring}` : "opacity-60 hover:opacity-100"
              }`}
            >
              {accent === c.id && <Check className="size-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Icon */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Ikona projektu</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`flex size-9 items-center justify-center rounded-xl border text-lg transition-all ${
                icon === ic
                  ? "border-foreground/30 bg-muted ring-2 ring-foreground/10"
                  : "border-border/60 hover:border-border hover:bg-muted/40"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ template, setTemplate }: { template: string; setTemplate: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Wybierz strukturę która najlepiej pasuje do sposobu pracy Twojego zespołu.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              template === t.id
                ? "border-foreground/20 bg-muted ring-2 ring-foreground/10"
                : "border-border/60 hover:border-border hover:bg-muted/30"
            }`}
          >
            {template === t.id && (
              <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-foreground">
                <Check className="size-3 text-background" />
              </span>
            )}
            <span className={`flex size-10 items-center justify-center rounded-xl ${t.color}`}>
              {t.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {t.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="h-4 rounded-full px-1.5 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({ members, setMembers }: { members: InvitedMember[]; setMembers: (v: InvitedMember[]) => void }) {
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

  const roles: Role[] = ["Admin", "Member", "Viewer"]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Dodaj członków którzy będą pracować w tym projekcie. Możesz to zrobić też później.
      </p>

      {/* Owner (always present) */}
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

      {/* Invited */}
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
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
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

      {/* Add from pool */}
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

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [step, setStep] = React.useState(1)
  const [name,        setName]        = React.useState("")
  const [description, setDescription] = React.useState("")
  const [accent,      setAccent]      = React.useState("violet")
  const [icon,        setIcon]        = React.useState("🚀")
  const [template,    setTemplate]    = React.useState("kanban")
  const [members,     setMembers]     = React.useState<InvitedMember[]>([])

  const TOTAL = 3
  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 2 ? !!template :
    true

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => {
      setStep(1); setName(""); setDescription("")
      setAccent("violet"); setIcon("🚀")
      setTemplate("kanban"); setMembers([])
    }, 300)
  }

  function handleCreate() {
    // handle project creation here
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-xl flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Nowy projekt
            </DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Krok {step} z {TOTAL}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center border-b border-border/50 px-6 py-4">
          <StepIndicator current={step} total={TOTAL} />
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: "60vh" }}>
          {step === 1 && (
            <Step1
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              accent={accent} setAccent={setAccent}
              icon={icon} setIcon={setIcon}
            />
          )}
          {step === 2 && <Step2 template={template} setTemplate={setTemplate} />}
          {step === 3 && <Step3 members={members} setMembers={setMembers} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={() => step > 1 ? setStep(s => s - 1) : handleClose()}
          >
            <ChevronLeft className="size-3.5" />
            {step === 1 ? "Anuluj" : "Wstecz"}
          </Button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 === step ? "w-5 bg-foreground" : i + 1 < step ? "w-1.5 bg-foreground/40" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          {step < TOTAL ? (
            <Button
              size="sm"
              className="h-8 gap-1.5"
              disabled={!canNext}
              onClick={() => setStep(s => s + 1)}
            >
              Dalej
              <ChevronRight className="size-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="h-8 gap-1.5" onClick={handleCreate}>
              <Check className="size-3.5" />
              Utwórz projekt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
