import {
  CheckCircle2,
  MessageSquare,
  Plus,
  UserPlus,
  MoveRight,
  Pencil,
  Paperclip,
  Star,
  Trash2,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType =
  | "created_task"
  | "commented"
  | "completed"
  | "moved"
  | "assigned"
  | "edited"
  | "attached"
  | "starred"
  | "deleted"
  | "created_board"

interface ActivityItem {
  id: number
  user: { name: string; initials: string; color: string }
  action: ActionType
  subject: string
  target?: string
  time: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TODAY: ActivityItem[] = [
  {
    id: 1,
    user: { name: "Karolina Nowak", initials: "KN", color: "from-sky-500 to-cyan-600" },
    action: "created_task",
    subject: "Zaimplementować dark mode",
    target: "Redesign strony głównej",
    time: "przed chwilą",
  },
  {
    id: 2,
    user: { name: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600" },
    action: "commented",
    subject: "Autoryzacja OAuth – callback URL trzeba zmienić na nowy endpoint",
    target: "Zaimplementować autoryzację OAuth",
    time: "12 min temu",
  },
  {
    id: 3,
    user: { name: "Marcin Kowalski", initials: "MK", color: "from-amber-500 to-orange-600" },
    action: "completed",
    subject: "Code review – moduł płatności",
    time: "47 min temu",
  },
  {
    id: 4,
    user: { name: "Anna Nowak", initials: "AN", color: "from-rose-500 to-pink-600" },
    action: "moved",
    subject: "Optymalizacja zapytań SQL",
    target: "W toku",
    time: "1 godz. temu",
  },
  {
    id: 5,
    user: { name: "Tomasz Wiśniewski", initials: "TW", color: "from-emerald-500 to-teal-600" },
    action: "assigned",
    subject: "Napisać testy jednostkowe dla API",
    target: "Karolina Nowak",
    time: "2 godz. temu",
  },
  {
    id: 6,
    user: { name: "Julia Kowalczyk", initials: "JK", color: "from-fuchsia-500 to-purple-600" },
    action: "attached",
    subject: "stripe-diagram.png",
    target: "Code review – moduł płatności",
    time: "3 godz. temu",
  },
]

const YESTERDAY: ActivityItem[] = [
  {
    id: 7,
    user: { name: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600" },
    action: "created_board",
    subject: "Sprint Q2 – Backend",
    time: "wczoraj, 17:22",
  },
  {
    id: 8,
    user: { name: "Karolina Nowak", initials: "KN", color: "from-sky-500 to-cyan-600" },
    action: "commented",
    subject: "Używamy Jest czy Vitest? Warto ujednolicić przed startem.",
    target: "Napisać testy jednostkowe dla API",
    time: "wczoraj, 15:08",
  },
  {
    id: 9,
    user: { name: "Marcin Kowalski", initials: "MK", color: "from-amber-500 to-orange-600" },
    action: "edited",
    subject: "Migracja bazy danych v3",
    time: "wczoraj, 13:45",
  },
  {
    id: 10,
    user: { name: "Anna Nowak", initials: "AN", color: "from-rose-500 to-pink-600" },
    action: "starred",
    subject: "Redesign strony głównej",
    time: "wczoraj, 11:30",
  },
  {
    id: 11,
    user: { name: "Tomasz Wiśniewski", initials: "TW", color: "from-emerald-500 to-teal-600" },
    action: "completed",
    subject: "Konfiguracja CI/CD pipeline",
    time: "wczoraj, 9:14",
  },
]

const LAST_WEEK: ActivityItem[] = [
  {
    id: 12,
    user: { name: "Julia Kowalczyk", initials: "JK", color: "from-fuchsia-500 to-purple-600" },
    action: "created_task",
    subject: "Integracja z systemem płatności",
    target: "Sprint Q2 – Backend",
    time: "wt, 16:00",
  },
  {
    id: 13,
    user: { name: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600" },
    action: "commented",
    subject: "Mam już listę 12 zapytań do optymalizacji z Datadog.",
    target: "Optymalizacja zapytań SQL",
    time: "wt, 14:32",
  },
  {
    id: 14,
    user: { name: "Marcin Kowalski", initials: "MK", color: "from-amber-500 to-orange-600" },
    action: "assigned",
    subject: "Optymalizacja zapytań SQL",
    target: "Tomasz Wiśniewski",
    time: "wt, 11:20",
  },
  {
    id: 15,
    user: { name: "Karolina Nowak", initials: "KN", color: "from-sky-500 to-cyan-600" },
    action: "moved",
    subject: "Dashboard analityczny",
    target: "Do przeglądu",
    time: "pon, 15:47",
  },
  {
    id: 16,
    user: { name: "Anna Nowak", initials: "AN", color: "from-rose-500 to-pink-600" },
    action: "deleted",
    subject: "Stary landing page v1",
    time: "pon, 10:05",
  },
  {
    id: 17,
    user: { name: "Tomasz Wiśniewski", initials: "TW", color: "from-emerald-500 to-teal-600" },
    action: "created_board",
    subject: "Kampania marketingowa Q2",
    time: "pon, 9:00",
  },
  {
    id: 18,
    user: { name: "Bartosz B.", initials: "BB", color: "from-violet-500 to-indigo-600" },
    action: "attached",
    subject: "oauth-flow.png",
    target: "Zaimplementować autoryzację OAuth",
    time: "sb, 12:33",
  },
]

// ─── Action config ────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  ActionType,
  { icon: React.ReactNode; iconBg: string; render: (item: ActivityItem) => React.ReactNode }
> = {
  created_task: {
    icon: <Plus className="size-3.5" />,
    iconBg: "bg-violet-100 text-violet-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" utworzyła zadanie "}
        <span className="font-semibold text-foreground">„{item.subject}"</span>
        {item.target && <>{" w tablicy "}<span className="text-muted-foreground">{item.target}</span></>}
      </>
    ),
  },
  commented: {
    icon: <MessageSquare className="size-3.5" />,
    iconBg: "bg-sky-100 text-sky-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" skomentował "}
        {item.target && <><span className="font-semibold text-foreground">„{item.target}"</span>{": "}</>}
        <span className="italic text-muted-foreground">„{item.subject}"</span>
      </>
    ),
  },
  completed: {
    icon: <CheckCircle2 className="size-3.5" />,
    iconBg: "bg-emerald-100 text-emerald-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" ukończył zadanie "}
        <span className="font-semibold text-foreground">„{item.subject}"</span>
      </>
    ),
  },
  moved: {
    icon: <MoveRight className="size-3.5" />,
    iconBg: "bg-amber-100 text-amber-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" przesunął "}
        <span className="font-semibold text-foreground">{item.subject}</span>
        {" do "}
        <span className="font-semibold text-foreground">{item.target}</span>
      </>
    ),
  },
  assigned: {
    icon: <UserPlus className="size-3.5" />,
    iconBg: "bg-indigo-100 text-indigo-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" przypisał "}
        <span className="font-semibold text-foreground">{item.subject}</span>
        {" do "}
        <span className="font-semibold text-foreground">{item.target}</span>
      </>
    ),
  },
  edited: {
    icon: <Pencil className="size-3.5" />,
    iconBg: "bg-slate-100 text-slate-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" edytował zadanie "}
        <span className="font-semibold text-foreground">„{item.subject}"</span>
      </>
    ),
  },
  attached: {
    icon: <Paperclip className="size-3.5" />,
    iconBg: "bg-teal-100 text-teal-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" dodał załącznik "}
        <span className="font-semibold text-foreground">{item.subject}</span>
        {item.target && <>{" w "}<span className="text-muted-foreground">{item.target}</span>{"</>"}</>}
      </>
    ),
  },
  starred: {
    icon: <Star className="size-3.5" />,
    iconBg: "bg-yellow-100 text-yellow-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" oznaczyła „"}
        <span className="font-semibold text-foreground">{item.subject}</span>
        {"jako ważne"}
      </>
    ),
  },
  deleted: {
    icon: <Trash2 className="size-3.5" />,
    iconBg: "bg-rose-100 text-rose-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" usunął "}
        <span className="font-semibold text-foreground">„{item.subject}"</span>
      </>
    ),
  },
  created_board: {
    icon: <Plus className="size-3.5" />,
    iconBg: "bg-fuchsia-100 text-fuchsia-600",
    render: (item) => (
      <>
        <span className="font-semibold text-foreground">{item.user.name}</span>
        {" utworzył tablicę "}
        <span className="font-semibold text-foreground">„{item.subject}"</span>
      </>
    ),
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActivityGroup({ label, items }: { label: string; items: ActivityItem[] }) {
  return (
    <div>
      {/* Group label */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="flex-1">
          <Separator />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground/60">
          {items.length} zdarzeń
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col">
        {items.map((item, i) => {
          const cfg = ACTION_CONFIG[item.action]
          return (
            <div key={item.id} className="group flex items-start gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}>
                  {cfg.icon}
                </div>
                {i < items.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-border/50" style={{ minHeight: "1.5rem" }} />
                )}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col pb-5">
                <div className="flex items-start gap-3">
                  {/* User avatar */}
                  <div
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.user.color} text-[9px] font-bold text-white ring-2 ring-background`}
                  >
                    {item.user.initials}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {cfg.render(item)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">{item.time}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const total = TODAY.length + YESTERDAY.length + LAST_WEEK.length

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">

      {/* Heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Aktywność obszaru roboczego
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Śledź wszystko co dzieje się w Twoim obszarze roboczym.
          </p>
        </div>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground/60">
          {total} zdarzeń łącznie
        </span>
      </div>

      {/* Feed */}
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-10">
        <ActivityGroup label="Dzisiaj" items={TODAY} />
        <ActivityGroup label="Wczoraj" items={YESTERDAY} />
        <ActivityGroup label="Zeszły tydzień" items={LAST_WEEK} />
      </div>

    </div>
  )
}
