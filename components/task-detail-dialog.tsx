"use client"

import * as React from "react"
import {
  X,
  Paperclip,
  Upload,
  Send,
  Clock,
  AlertCircle,
  CircleDot,
  CheckCircle2,
  Circle,
  Plus,
  FileText,
  Image as ImageIcon,
  History,
  MessageSquare,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskDetail {
  id: number
  name: string
  description: string
  status: string
  priority: string
  due: string
  assignee: { initials: string; name: string; color: string }
  labels: string[]
  attachments: { name: string; size: string; type: "image" | "file" }[]
  comments: { id: number; author: string; initials: string; color: string; text: string; time: string }[]
  history: { id: number; author: string; initials: string; color: string; action: string; time: string }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    "w trakcie": {
      label: "W trakcie",
      className: "border-sky-200 bg-sky-50 text-sky-700",
      icon: <CircleDot className="size-3" />,
    },
    "do zrobienia": {
      label: "Do zrobienia",
      className: "border-border bg-muted/60 text-muted-foreground",
      icon: <Circle className="size-3" />,
    },
    ukończone: {
      label: "Ukończone",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 className="size-3" />,
    },
  }
  const s = map[status] ?? map["do zrobienia"]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; className: string }> = {
    wysoki: { label: "Wysoki", className: "text-rose-600 bg-rose-50 border-rose-200" },
    średni: { label: "Średni", className: "text-amber-600 bg-amber-50 border-amber-200" },
    niski: { label: "Niski", className: "text-slate-500 bg-slate-50 border-slate-200" },
  }
  const p = map[priority] ?? map["niski"]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${p.className}`}>
      <AlertCircle className="size-3" />
      {p.label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TaskDetailDialogProps {
  task: TaskDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [comment, setComment] = React.useState("")
  const [labels, setLabels] = React.useState<string[]>(task?.labels ?? [])

  React.useEffect(() => {
    if (task) setLabels(task.labels)
  }, [task])

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[80vh] w-full max-w-5xl gap-0 overflow-hidden p-0"
      >
        {/* ── Left: main content ──────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-border/50 px-6 py-4">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-snug text-foreground">
                {task.name}
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Zadanie #{task.id} · zaktualizowano właśnie teraz
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-5 px-6 py-5">

              {/* Description */}
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Opis
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {task.description}
                </p>
              </div>

              <Separator />

              {/* Activity tabs */}
              <Tabs defaultValue="comments">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Aktywność
                  </p>
                  <TabsList variant="line" className="h-7 gap-0">
                    <TabsTrigger value="comments" className="h-7 gap-1.5 px-2.5 text-xs">
                      <MessageSquare className="size-3.5" />
                      Komentarze
                    </TabsTrigger>
                    <TabsTrigger value="history" className="h-7 gap-1.5 px-2.5 text-xs">
                      <History className="size-3.5" />
                      Historia
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Comments */}
                <TabsContent value="comments" className="mt-4">
                  <div className="flex flex-col gap-3">
                    {task.comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2.5">
                        <div className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-[10px] font-bold text-white`}>
                          {c.initials}
                        </div>
                        <div className="flex-1 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{c.author}</span>
                            <span className="text-[10px] text-muted-foreground">{c.time}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/80">{c.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add comment */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white">
                        BB
                      </div>
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2">
                        <input
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Dodaj komentarz..."
                          className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          disabled={!comment.trim()}
                          className="size-6 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          onClick={() => setComment("")}
                        >
                          <Send className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* History */}
                <TabsContent value="history" className="mt-4">
                  <div className="flex flex-col gap-0">
                    {task.history.map((h, i) => (
                      <div key={h.id} className="flex items-start gap-2.5">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${h.color} text-[9px] font-bold text-white`}>
                            {h.initials}
                          </div>
                          {i < task.history.length - 1 && (
                            <div className="mt-1 w-px flex-1 bg-border/50" style={{ minHeight: "1.5rem" }} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-xs text-muted-foreground leading-snug">
                            <span className="font-medium text-foreground">{h.author}</span>{" "}
                            {h.action}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock className="size-2.5" />
                            {h.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>

        {/* ── Right: properties panel ─────────────────────────────────────── */}
        <div className="flex w-64 shrink-0 flex-col border-l border-border/50 bg-muted/20">
          <div className="border-b border-border/50 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Właściwości
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-0 px-4 py-4">

              {/* Assigned */}
              <PropertyRow label="Przypisany">
                <div className="flex items-center gap-2">
                  <div className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${task.assignee.color} text-[9px] font-bold text-white`}>
                    {task.assignee.initials}
                  </div>
                  <span className="text-xs font-medium text-foreground">{task.assignee.name}</span>
                </div>
              </PropertyRow>

              <PropertyRow label="Priorytet">
                <PriorityBadge priority={task.priority} />
              </PropertyRow>

              <PropertyRow label="Status">
                <StatusBadge status={task.status} />
              </PropertyRow>

              <PropertyRow label="Termin">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {task.due}
                </div>
              </PropertyRow>

              {/* Labels */}
              <div className="py-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Etykieta
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="h-5 cursor-pointer gap-1 rounded-full px-2 text-[11px] hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setLabels((prev) => prev.filter((l) => l !== label))}
                    >
                      {label}
                    </Badge>
                  ))}
                  <button
                    onClick={() => {
                      const val = prompt("Nazwa etykiety:")
                      if (val?.trim()) setLabels((prev) => [...prev, val.trim()])
                    }}
                    className="inline-flex h-5 items-center gap-0.5 rounded-full border border-dashed border-border px-2 text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    <Plus className="size-2.5" />
                    Dodaj
                  </button>
                </div>
              </div>

              <Separator className="my-1" />

              {/* Attachments */}
              <div className="py-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Załączniki
                </p>
                <div className="flex flex-col gap-1.5">
                  {task.attachments.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-2"
                    >
                      {file.type === "image" ? (
                        <ImageIcon className="size-3.5 shrink-0 text-sky-500" />
                      ) : (
                        <FileText className="size-3.5 shrink-0 text-violet-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-foreground">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.size}</p>
                      </div>
                      <Paperclip className="size-3 shrink-0 text-muted-foreground/40" />
                    </div>
                  ))}

                  {/* Upload button */}
                  <button className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/60 px-2.5 py-2 text-[11px] text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground">
                    <Upload className="size-3.5 shrink-0" />
                    Prześlij plik
                  </button>
                </div>
              </div>

            </div>
          </ScrollArea>

          {/* Save button */}
          <div className="border-t border-border/50 p-3">
            <Button size="sm" className="h-8 w-full text-xs font-medium">
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helper sub-component ─────────────────────────────────────────────────────

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <p className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}
