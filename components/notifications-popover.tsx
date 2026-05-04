"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import {
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Check,
  Bell,
  Users,
} from "lucide-react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { formatActivityTime } from "@/components/activity/activity-render"

type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "TASK_COMMENTED"
  | "MEMBER_ADDED"

interface ActorUser {
  _id?: string
  name?: string
  surname?: string
  email?: string
  image?: string | null
}

interface NotificationRecord {
  _id: Id<"notifications">
  _creationTime: number
  type: NotificationType
  read: boolean
  actorId: string
  actor: ActorUser | null
  workspace: { _id: string; name: string; icon?: string } | null
  metadata?: Record<string, unknown> | null
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  TASK_ASSIGNED:  <UserPlus      className="size-3.5 text-amber-500" />,
  TASK_COMPLETED: <CheckCircle2  className="size-3.5 text-emerald-500" />,
  TASK_COMMENTED: <MessageSquare className="size-3.5 text-sky-500" />,
  MEMBER_ADDED:   <Users         className="size-3.5 text-violet-500" />,
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

function actorName(actor: ActorUser | null): string {
  if (!actor) return "Ktoś"
  return [actor.name, actor.surname].filter(Boolean).join(" ") || actor.email || "Ktoś"
}

function actorInitials(actor: ActorUser | null): string {
  if (!actor) return "?"
  const a = actor.name?.[0] ?? ""
  const b = actor.surname?.[0] ?? ""
  const out = (a + b).toUpperCase()
  return out || actor.email?.[0]?.toUpperCase() || "?"
}

function metaString(n: NotificationRecord, key: string): string | undefined {
  const v = n.metadata?.[key]
  return typeof v === "string" ? v : undefined
}

function buildTitle(n: NotificationRecord): string {
  const name = actorName(n.actor)
  switch (n.type) {
    case "TASK_ASSIGNED":
      return `${name} przypisał(a) Ci zadanie`
    case "TASK_COMPLETED":
      return `${name} ukończył(a) Twoje zadanie`
    case "TASK_COMMENTED":
      return `${name} skomentował(a) zadanie`
    case "MEMBER_ADDED":
      return `${name} dodał(a) Cię do projektu`
  }
}

function buildBody(n: NotificationRecord): string {
  const taskTitle = metaString(n, "taskTitle")
  const boardName = metaString(n, "boardName")
  const workspaceName = metaString(n, "workspaceName")
  switch (n.type) {
    case "TASK_ASSIGNED":
    case "TASK_COMPLETED":
    case "TASK_COMMENTED":
      return [taskTitle ? `„${taskTitle}”` : null, boardName].filter(Boolean).join(" · ")
    case "MEMBER_ADDED":
      return workspaceName ? `„${workspaceName}”` : ""
  }
}

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
  const notifications = useQuery(api.notifications.list, { limit: 30 }) as
    | NotificationRecord[]
    | undefined
  const markRead = useMutation(api.notifications.markRead)
  const markAllRead = useMutation(api.notifications.markAllRead)

  const [tab, setTab] = React.useState<"all" | "unread">("all")
  const [now] = React.useState(() => Date.now())

  const list = notifications ?? []
  const unreadCount = list.filter((n) => !n.read).length
  const visible = tab === "unread" ? list.filter((n) => !n.read) : list

  function handleClick(n: NotificationRecord) {
    if (!n.read) markRead({ id: n._id })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side} align={align} sideOffset={8} className="w-[360px] p-0">
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
              onClick={() => markAllRead()}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Check className="size-3" />
              Oznacz wszystkie
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border/50 px-4">
          {(["all", "unread"] as const).map((t) => (
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
          {notifications === undefined && (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted/50" />
              ))}
            </div>
          )}

          {notifications && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Bell className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {tab === "unread" ? "Brak nieodczytanych" : "Brak powiadomień"}
              </p>
            </div>
          )}

          {notifications &&
            visible.map((n, i) => {
              const title = buildTitle(n)
              const body = buildBody(n)
              return (
                <React.Fragment key={n._id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      !n.read ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div className="relative mt-0.5 shrink-0">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(n.actorId)} text-[10px] font-bold text-white`}
                      >
                        {actorInitials(n.actor)}
                      </div>
                      <div className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border-2 border-popover bg-background">
                        {TYPE_ICON[n.type]}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs leading-snug ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}
                      >
                        {title}
                      </p>
                      {body && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{body}</p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground/60">
                        {formatActivityTime(n._creationTime, now)}
                      </p>
                    </div>

                    {!n.read && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                  {i < visible.length - 1 && <Separator className="opacity-50" />}
                </React.Fragment>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
