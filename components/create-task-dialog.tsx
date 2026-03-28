"use client"

import * as React from "react"
import {
  X,
  ArrowUp,
  Minus,
  ArrowDown,
  Circle,
  CircleDot,
  CheckCircle2,
  Paperclip,
  Tag,
  Plus,
  FileText,
  Image as ImageIcon,
  CalendarDays,
  User,
  ChevronDown,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// ─── Data ─────────────────────────────────────────────────────────────────────

const MEMBERS = [
  { initials: "BB", name: "Bartosz B.",  color: "from-violet-500 to-indigo-600" },
  { initials: "KN", name: "Karolina N.", color: "from-sky-500 to-cyan-600" },
  { initials: "MK", name: "Marcin K.",   color: "from-amber-500 to-orange-600" },
  { initials: "AN", name: "Anna N.",     color: "from-rose-500 to-pink-600" },
  { initials: "TW", name: "Tomasz W.",   color: "from-emerald-500 to-teal-600" },
]

const PRIORITIES = [
  { id: "krytyczny", label: "Krytyczny", icon: <ArrowUp   className="size-3" />, color: "text-red-500"    },
  { id: "wysoki",    label: "Wysoki",    icon: <ArrowUp   className="size-3" />, color: "text-orange-500" },
  { id: "sredni",    label: "Średni",    icon: <Minus     className="size-3" />, color: "text-amber-500"  },
  { id: "niski",     label: "Niski",     icon: <ArrowDown className="size-3" />, color: "text-slate-400"  },
]

const STATUSES = [
  { id: "todo",       label: "Do zrobienia", icon: <Circle       className="size-3" />, color: "text-slate-400"   },
  { id: "inprogress", label: "W toku",       icon: <CircleDot    className="size-3" />, color: "text-sky-500"     },
  { id: "review",     label: "Do przeglądu", icon: <CircleDot    className="size-3" />, color: "text-amber-500"   },
  { id: "done",       label: "Gotowe",       icon: <CheckCircle2 className="size-3" />, color: "text-emerald-500" },
]

const ALL_TAGS = ["Frontend", "Backend", "Design", "DevOps", "Testy", "Dokumentacja", "Bug", "Wydajność"]

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function Dropdown({
  open, onClose, children, align = "left",
}: { open: boolean; onClose: () => void; children: React.ReactNode; align?: "left" | "right" }) {
  React.useEffect(() => {
    if (!open) return
    const h = () => onClose()
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      className={`absolute top-full z-50 mt-1.5 min-w-[180px] rounded-xl border border-border/60 bg-popover shadow-lg ${align === "right" ? "right-0" : "left-0"}`}
    >
      {children}
    </div>
  )
}

// ─── Pill button ──────────────────────────────────────────────────────────────

function Pill({
  active = false,
  onClick,
  children,
}: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all ${
        active
          ? "border-border bg-muted text-foreground"
          : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [title,     setTitle]     = React.useState("")
  const [desc,      setDesc]      = React.useState("")
  const [assignees, setAssignees] = React.useState<string[]>([])
  const [priority,  setPriority]  = React.useState<string | null>(null)
  const [status,    setStatus]    = React.useState<string | null>(null)
  const [due,       setDue]       = React.useState("")
  const [tags,      setTags]      = React.useState<string[]>([])
  const [files,     setFiles]     = React.useState<{ name: string; size: string; type: "image" | "file" }[]>([])
  const [drop,      setDrop]      = React.useState<string | null>(null)

  const fileRef  = React.useRef<HTMLInputElement>(null)
  const dateRef  = React.useRef<HTMLInputElement>(null)

  function reset() {
    setTitle(""); setDesc(""); setAssignees([])
    setPriority(null); setStatus(null); setDue("")
    setTags([]); setFiles([]); setDrop(null)
  }

  function handleClose() { onOpenChange(false); setTimeout(reset, 300) }
  function handleCreate() { handleClose() }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      type: (f.type.startsWith("image/") ? "image" : "file") as "image" | "file",
    }))
    setFiles(prev => [...prev, ...picked])
    e.target.value = ""
  }

  const selectedPriority = PRIORITIES.find(p => p.id === priority)
  const selectedStatus   = STATUSES.find(s => s.id === status)

  const dueFmt = due
    ? new Date(due + "T00:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "short" })
    : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-lg flex-col gap-0 overflow-visible p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
          <DialogTitle className="text-sm font-semibold text-foreground">
            Utwórz zadanie
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-col px-5 pt-4 pb-5">

          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nazwa zadania..."
            className="w-full bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
          />

          {/* Description */}
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
            placeholder="Dodaj opis zadania..."
            className="mt-2.5 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/35"
          />

          {/* Meta pill row */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">

            {/* Przypisz */}
            <div className="relative">
              <Pill active={assignees.length > 0 || drop === "assignees"} onClick={() => setDrop(v => v === "assignees" ? null : "assignees")}>
                {assignees.length > 0 ? (
                  <>
                    <div className="flex -space-x-1">
                      {assignees.slice(0, 3).map(ini => {
                        const m = MEMBERS.find(m => m.initials === ini)!
                        return (
                          <div key={ini} className={`flex size-4 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-[8px] font-bold text-white ring-1 ring-background`}>
                            {ini[0]}
                          </div>
                        )
                      })}
                    </div>
                    <span>
                      {assignees.length === 1
                        ? MEMBERS.find(m => m.initials === assignees[0])?.name.split(" ")[0]
                        : `${assignees.length} osoby`}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="size-3" />
                    Przypisz
                  </>
                )}
                <ChevronDown className="size-2.5 text-muted-foreground/60" />
              </Pill>
              <Dropdown open={drop === "assignees"} onClose={() => setDrop(null)}>
                <div className="p-1">
                  {MEMBERS.map(m => {
                    const sel = assignees.includes(m.initials)
                    return (
                      <button
                        key={m.initials}
                        onClick={() => setAssignees(p => sel ? p.filter(i => i !== m.initials) : [...p, m.initials])}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${sel ? "bg-muted" : ""}`}
                      >
                        <div className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-[9px] font-bold text-white`}>
                          {m.initials}
                        </div>
                        {m.name}
                        {sel && <span className="ml-auto size-1.5 rounded-full bg-foreground" />}
                      </button>
                    )
                  })}
                </div>
              </Dropdown>
            </div>

            {/* Priorytet */}
            <div className="relative">
              <Pill active={!!priority || drop === "priority"} onClick={() => setDrop(v => v === "priority" ? null : "priority")}>
                {selectedPriority ? (
                  <span className={`flex items-center gap-1.5 ${selectedPriority.color}`}>
                    {selectedPriority.icon}
                    <span className="text-foreground">{selectedPriority.label}</span>
                  </span>
                ) : (
                  <>
                    <Minus className="size-3" />
                    Priorytet
                  </>
                )}
                <ChevronDown className="size-2.5 text-muted-foreground/60" />
              </Pill>
              <Dropdown open={drop === "priority"} onClose={() => setDrop(null)}>
                <div className="p-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setPriority(p.id); setDrop(null) }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${priority === p.id ? "bg-muted" : ""}`}
                    >
                      <span className={p.color}>{p.icon}</span>
                      {p.label}
                      {priority === p.id && <span className="ml-auto size-1.5 rounded-full bg-foreground" />}
                    </button>
                  ))}
                </div>
              </Dropdown>
            </div>

            {/* Status */}
            <div className="relative">
              <Pill active={!!status || drop === "status"} onClick={() => setDrop(v => v === "status" ? null : "status")}>
                {selectedStatus ? (
                  <span className={`flex items-center gap-1.5 ${selectedStatus.color}`}>
                    {selectedStatus.icon}
                    <span className="text-foreground">{selectedStatus.label}</span>
                  </span>
                ) : (
                  <>
                    <Circle className="size-3" />
                    Status
                  </>
                )}
                <ChevronDown className="size-2.5 text-muted-foreground/60" />
              </Pill>
              <Dropdown open={drop === "status"} onClose={() => setDrop(null)}>
                <div className="p-1">
                  {STATUSES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setStatus(s.id); setDrop(null) }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${status === s.id ? "bg-muted" : ""}`}
                    >
                      <span className={s.color}>{s.icon}</span>
                      {s.label}
                      {status === s.id && <span className="ml-auto size-1.5 rounded-full bg-foreground" />}
                    </button>
                  ))}
                </div>
              </Dropdown>
            </div>

            {/* Termin */}
            <div className="relative">
              <Pill active={!!due} onClick={() => dateRef.current?.showPicker?.()}>
                <CalendarDays className={`size-3 ${due ? "text-foreground" : ""}`} />
                {dueFmt ?? "Termin"}
              </Pill>
              <input
                ref={dateRef}
                type="date"
                value={due}
                onChange={e => setDue(e.target.value)}
                className="pointer-events-none absolute inset-0 h-0 w-0 opacity-0"
              />
            </div>

          </div>

          <Separator className="my-4" />

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Tagi
              </span>
              {tags.map(t => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="h-5 cursor-pointer gap-1 rounded-full px-2 text-[10px] hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setTags(p => p.filter(x => x !== t))}
                >
                  {t} <X className="size-2.5" />
                </Badge>
              ))}
              <div className="relative">
                <button
                  onClick={() => setDrop(v => v === "tags" ? null : "tags")}
                  className={`inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[10px] font-medium transition-all ${
                    drop === "tags"
                      ? "border-border bg-muted text-foreground"
                      : "border-dashed border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  <Plus className="size-2.5" />
                  Dodaj
                </button>
                <Dropdown open={drop === "tags"} onClose={() => setDrop(null)} align="left">
                  <div className="p-1">
                    {ALL_TAGS.map(t => {
                      const sel = tags.includes(t)
                      return (
                        <button
                          key={t}
                          onClick={() => setTags(p => sel ? p.filter(x => x !== t) : [...p, t])}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${sel ? "bg-muted" : ""}`}
                        >
                          <Tag className="size-3 text-muted-foreground" />
                          {t}
                          {sel && <span className="ml-auto size-1.5 rounded-full bg-foreground" />}
                        </button>
                      )
                    })}
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Załączniki
              </span>
              {files.length > 0 && (
                <span className="text-[10px] text-muted-foreground">({files.length})</span>
              )}
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1.5">
                    {f.type === "image"
                      ? <ImageIcon className="size-3.5 shrink-0 text-sky-500" />
                      : <FileText  className="size-3.5 shrink-0 text-violet-500" />
                    }
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">{f.size}</span>
                    <button
                      onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                      className="text-muted-foreground/40 transition-colors hover:text-rose-500"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/50 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-muted/30 hover:text-foreground"
            >
              <Paperclip className="size-3.5" />
              Prześlij plik
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/50 px-5 py-3.5">
          <Button variant="outline" size="sm" className="h-8" onClick={handleClose}>
            Anuluj
          </Button>
          <Button size="sm" className="h-8" disabled={!title.trim()} onClick={handleCreate}>
            Utwórz zadanie
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
