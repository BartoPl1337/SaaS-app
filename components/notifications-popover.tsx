"use client"

import * as React from "react"
import {
  CheckCircle2,
  MessageSquare,
  UserPlus,
  AtSign,
  AlertCircle,
  Check,
  Bell,
} from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ─── Data ─────────────────────────────────────────────────────────────────────

type NotifType = "mention" | "comment" | "assigned" | "done" | "alert"

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  avatar?: { initials: string; color: string }
}

const INITIAL: Notification[] = [
  {
    id: "1",
    type: "mention",
    title: "Karolina N. wspomniała o Tobie",
    body: "w zadaniu „Redesign strony głównej”",
    time: "2 min temu",
    read: false,
    avatar: { initials: "KN", color: "from-sky-500 to-cyan-600" },
  },
  {
    id: "2",
    type: "assigned",
    title: "Przypisano Ci zadanie",
    body: "„Integracja z API płatności” · Sprint 4",
    time: "18 min temu",
    read: false,
    avatar: { initials: "MK", color: "from-amber-500 to-orange-600" },
  },
  {
    id: "3",
    type: "comment",
    title: "Anna N. skomentowała",
    body: "„Optymalizacja zapytań SQL” — Dobra robota!",
    time: "1 godz. temu",
    read: false,
    avatar: { initials: "AN", color: "from-rose-500 to-pink-600" },
  },
  {
    id: "4",
    type: "done",
    title: "Zadanie ukończone",
    body: "„Konfiguracja CI/CD pipeline” zostało oznaczone jako Gotowe",
    time: "3 godz. temu",
    read: true,
  },
  {
    id: "5",
    type: "alert",
    title: "Zbliża się termin",
    body: "„Migracja bazy danych” — pozostał 1 dzień",
    time: "wczoraj",
    read: true,
  },
  {
    id: "6",
    type: "assigned",
    title: "Tomasz W. przypisał Ci zadanie",
    body: "„Dokumentacja API v2” · Backlog",
    time: "wczoraj",
    read: true,
    avatar: { initials: "TW", color: "from-emerald-500 to-teal-600" },
  },
]

const TYPE_ICON: Record<NotifType, React.ReactNode> = {
  mention:  <AtSign       className="size-3.5 text-violet-500" />,
  comment:  <MessageSquare className="size-3.5 text-sky-500"   />,
  assigned: <UserPlus     className="size-3.5 text-amber-500" />,
  done:     <CheckCircle2 className="size-3.5 text-emerald-500" />,
  alert:    <AlertCircle  className="size-3.5 text-rose-500"   />,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationsPopoverProps {
  children: React.ReactNode
  side?: "bottom" | "left"
  align?: "end" | "start" | "center"
}

export function NotificationsPopover({
  children,
  side = "bottom",
  align = "end",
}: NotificationsPopoverProps) {
  const [notifs, setNotifs] = React.useState<Notification[]>(INITIAL)
  const [tab, setTab] = React.useState<"all" | "unread">("all")

  const unreadCount = notifs.filter(n => !n.read).length
  const visible = tab === "unread" ? notifs.filter(n => !n.read) : notifs

  function markAll() {
    setNotifs(p => p.map(n => ({ ...n, read: true })))
  }

  function markOne(id: string) {
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-[360px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-foreground" />
            <span className="text-sm font-semibold text-foreground">Powiadomienia</span>
            {unreadCount > 0 && (
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Check className="size-3" />
              Oznacz wszystkie
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border/50 px-4">
          {(["all", "unread"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-2.5 pr-3 text-xs font-medium transition-colors ${
                tab === t
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "Wszystkie" : "Nieodczytane"}
              {t === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex max-h-[360px] flex-col overflow-y-auto">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Bell className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Brak powiadomień</p>
            </div>
          ) : (
            visible.map((n, i) => (
              <React.Fragment key={n.id}>
                <button
                  onClick={() => markOne(n.id)}
                  className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    !n.read ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  {/* Avatar or icon */}
                  <div className="relative mt-0.5 shrink-0">
                    {n.avatar ? (
                      <div className={`flex size-8 items-center justify-center rounded-full bg-gradient-to-br ${n.avatar.color} text-[10px] font-bold text-white`}>
                        {n.avatar.initials}
                      </div>
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        {TYPE_ICON[n.type]}
                      </div>
                    )}
                    {n.avatar && (
                      <div className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border-2 border-popover bg-background">
                        {TYPE_ICON[n.type]}
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-snug ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">{n.time}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
                {i < visible.length - 1 && <Separator className="opacity-50" />}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Footer */}
        <Separator className="opacity-50" />
        <div className="px-4 py-2.5">
          <button className="w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Zobacz wszystkie powiadomienia
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
