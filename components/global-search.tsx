"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { CheckCircle2, Circle, CircleDot, Folder, Search } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { getAccentGradient } from "@/components/new-project-dialog/colors"

type Status = "todo" | "inprogress" | "review" | "done"

const STATUS_ICON: Record<Status, React.ReactNode> = {
  todo:       <Circle       className="size-3 text-slate-400" />,
  inprogress: <CircleDot    className="size-3 text-sky-500" />,
  review:     <CircleDot    className="size-3 text-amber-500" />,
  done:       <CheckCircle2 className="size-3 text-emerald-500" />,
}

export function GlobalSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const trimmed = query.trim()
  const enabled = trimmed.length >= 2
  const results = useQuery(api.search.global, enabled ? { q: trimmed } : "skip")

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const showDropdown = open && enabled
  const projects = results?.projects ?? []
  const tasks = results?.tasks ?? []
  const isLoading = enabled && results === undefined
  const isEmpty = !isLoading && projects.length === 0 && tasks.length === 0

  function navigate(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <div ref={containerRef} className="relative flex max-w-xs flex-1 items-center">
      <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground/60" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Szukaj..."
        className="h-8 w-full rounded-lg border-border/50 bg-muted/40 pl-8 text-sm placeholder:text-muted-foreground/50 focus-visible:bg-background focus-visible:ring-1"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-96 overflow-y-auto rounded-lg border border-border/60 bg-popover p-1 shadow-md">
          {isLoading && (
            <div className="px-3 py-3 text-xs text-muted-foreground">Szukam…</div>
          )}
          {isEmpty && (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Brak wyników dla &bdquo;{trimmed}&rdquo;
            </div>
          )}
          {projects.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <div className="px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Projekty
              </div>
              {projects.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => navigate(`/projects/${p._id}`)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${getAccentGradient(p.color)} text-xs`}
                  >
                    {p.icon ?? <Folder className="size-3.5 text-white" />}
                  </span>
                  <span className="truncate text-foreground">{p.name}</span>
                </button>
              ))}
            </div>
          )}
          {tasks.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Zadania
              </div>
              {tasks.map((t) =>
                t.workspaceId ? (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => navigate(`/projects/${t.workspaceId}`)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {STATUS_ICON[t.status as Status]}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-foreground">{t.title}</span>
                      {t.workspaceName && (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {t.workspaceName}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    key={t._id}
                    href="#"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    {STATUS_ICON[t.status as Status]}
                    <span className="truncate text-foreground">{t.title}</span>
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
