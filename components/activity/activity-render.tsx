import * as React from "react"
import {
  CheckCircle2,
  MessageSquare,
  Plus,
  UserPlus,
  MoveRight,
  Pencil,
  Paperclip,
  Trash2,
} from "lucide-react"

export type ActivityType =
  | "TASK_CREATED"
  | "TASK_COMMENTED"
  | "TASK_COMPLETED"
  | "TASK_MOVED"
  | "TASK_ASSIGNED"
  | "TASK_EDITED"
  | "TASK_ATTACHED"
  | "TASK_DELETED"
  | "BOARD_CREATED"
  | "BOARD_EDITED"
  | "BOARD_DELETED"

type StatusKey = "todo" | "inprogress" | "review" | "done"

const STATUS_LABELS: Record<StatusKey, string> = {
  todo: "Do zrobienia",
  inprogress: "W toku",
  review: "Do przeglądu",
  done: "Gotowe",
}

export interface ActivityUser {
  _id?: string
  name?: string
  surname?: string
  email?: string
  image?: string | null
}

export interface ActivityRecord {
  _id: string
  _creationTime: number
  type: ActivityType
  userId: string
  user: ActivityUser | null
  workspace: { _id: string; name: string; icon?: string } | null
  metadata?: Record<string, unknown> | null | undefined
}

export function activityUserName(user: ActivityUser | null): string {
  if (!user) return "Nieznany"
  const full = [user.name, user.surname].filter(Boolean).join(" ")
  return full || user.email || "Nieznany"
}

export function activityUserInitials(user: ActivityUser | null): string {
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

export function activityUserGradient(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

interface ActionConfig {
  icon: React.ReactNode
  iconBg: string
  render: (item: ActivityRecord, name: string) => React.ReactNode
}

function meta(item: ActivityRecord, key: string): string | undefined {
  const value = item.metadata?.[key]
  return typeof value === "string" ? value : undefined
}

function Title({ text }: { text: string }) {
  return <span className="font-semibold text-foreground">„{text}”</span>
}

const ACTION_CONFIG: Record<ActivityType, ActionConfig> = {
  TASK_CREATED: {
    icon: <Plus className="size-3.5" />,
    iconBg: "bg-violet-100 text-violet-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" utworzył(a) zadanie "}
        <Title text={meta(item, "taskTitle") ?? "—"} />
        {meta(item, "boardName") && (
          <>
            {" w tablicy "}
            <span className="text-muted-foreground">{meta(item, "boardName")}</span>
          </>
        )}
      </>
    ),
  },
  TASK_COMMENTED: {
    icon: <MessageSquare className="size-3.5" />,
    iconBg: "bg-sky-100 text-sky-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" skomentował(a) "}
        <Title text={meta(item, "taskTitle") ?? "—"} />
      </>
    ),
  },
  TASK_COMPLETED: {
    icon: <CheckCircle2 className="size-3.5" />,
    iconBg: "bg-emerald-100 text-emerald-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" ukończył(a) zadanie "}
        <Title text={meta(item, "taskTitle") ?? "—"} />
      </>
    ),
  },
  TASK_MOVED: {
    icon: <MoveRight className="size-3.5" />,
    iconBg: "bg-amber-100 text-amber-600",
    render: (item, name) => {
      const status = meta(item, "newStatus") as StatusKey | undefined
      const label = status ? STATUS_LABELS[status] ?? status : "—"
      return (
        <>
          <span className="font-semibold text-foreground">{name}</span>
          {" przesunął(ęła) "}
          <Title text={meta(item, "taskTitle") ?? "—"} />
          {" do "}
          <span className="font-semibold text-foreground">{label}</span>
        </>
      )
    },
  },
  TASK_ASSIGNED: {
    icon: <UserPlus className="size-3.5" />,
    iconBg: "bg-indigo-100 text-indigo-600",
    render: (item, name) => {
      const assignee = meta(item, "assigneeName")
      return (
        <>
          <span className="font-semibold text-foreground">{name}</span>
          {assignee ? (
            <>
              {" przypisał(a) "}
              <Title text={meta(item, "taskTitle") ?? "—"} />
              {" do "}
              <span className="font-semibold text-foreground">{assignee}</span>
            </>
          ) : (
            <>
              {" odznaczył(a) przypisanie z "}
              <Title text={meta(item, "taskTitle") ?? "—"} />
            </>
          )}
        </>
      )
    },
  },
  TASK_EDITED: {
    icon: <Pencil className="size-3.5" />,
    iconBg: "bg-slate-100 text-slate-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" edytował(a) zadanie "}
        <Title text={meta(item, "taskTitle") ?? "—"} />
      </>
    ),
  },
  TASK_ATTACHED: {
    icon: <Paperclip className="size-3.5" />,
    iconBg: "bg-teal-100 text-teal-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" dodał(a) załącznik do "}
        <Title text={meta(item, "taskTitle") ?? "—"} />
      </>
    ),
  },
  TASK_DELETED: {
    icon: <Trash2 className="size-3.5" />,
    iconBg: "bg-rose-100 text-rose-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" usunął(ęła) zadanie "}
        <Title text={meta(item, "taskTitle") ?? "—"} />
      </>
    ),
  },
  BOARD_CREATED: {
    icon: <Plus className="size-3.5" />,
    iconBg: "bg-fuchsia-100 text-fuchsia-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" utworzył(a) tablicę "}
        <Title text={meta(item, "boardName") ?? "—"} />
      </>
    ),
  },
  BOARD_EDITED: {
    icon: <Pencil className="size-3.5" />,
    iconBg: "bg-slate-100 text-slate-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" edytował(a) tablicę "}
        <Title text={meta(item, "boardName") ?? "—"} />
      </>
    ),
  },
  BOARD_DELETED: {
    icon: <Trash2 className="size-3.5" />,
    iconBg: "bg-rose-100 text-rose-600",
    render: (item, name) => (
      <>
        <span className="font-semibold text-foreground">{name}</span>
        {" usunął(ęła) tablicę "}
        <Title text={meta(item, "boardName") ?? "—"} />
      </>
    ),
  },
}

export function getActivityConfig(type: ActivityType): ActionConfig {
  return ACTION_CONFIG[type]
}

const PL_MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]
const PL_WEEKDAYS = ["nd", "pon", "wt", "śr", "czw", "pt", "sb"]

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function formatActivityTime(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)

  if (diffMin < 1) return "przed chwilą"
  if (diffMin < 60) return `${diffMin} min temu`

  const date = new Date(ts)
  const today = new Date(now)
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const startOfWeekAgo = startOfToday - 7 * 24 * 60 * 60 * 1000

  if (ts >= startOfToday) return `${diffHr} godz. temu`
  if (ts >= startOfYesterday) return `wczoraj, ${pad(date.getHours())}:${pad(date.getMinutes())}`
  if (ts >= startOfWeekAgo) return `${PL_WEEKDAYS[date.getDay()]}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
  return `${date.getDate()} ${PL_MONTHS[date.getMonth()]}`
}

export function timeBucketKey(ts: number, now: number = Date.now()): "today" | "yesterday" | "week" | "older" {
  const today = new Date(now)
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const startOfWeekAgo = startOfToday - 7 * 24 * 60 * 60 * 1000

  if (ts >= startOfToday) return "today"
  if (ts >= startOfYesterday) return "yesterday"
  if (ts >= startOfWeekAgo) return "week"
  return "older"
}
