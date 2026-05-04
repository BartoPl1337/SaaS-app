import { Kanban, List, LayoutGrid, Boxes } from "lucide-react"

export { ACCENT_COLORS, ICONS, getAccentGradient } from "./colors"

export const TEMPLATES = [
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

export const MEMBERS_POOL = [
  { initials: "KN", name: "Karolina Nowak",    color: "from-sky-500 to-cyan-600" },
  { initials: "MK", name: "Marcin Kowalski",   color: "from-amber-500 to-orange-600" },
  { initials: "AN", name: "Anna Nowak",         color: "from-rose-500 to-pink-600" },
  { initials: "TW", name: "Tomasz Wiśniewski",  color: "from-emerald-500 to-teal-600" },
  { initials: "JK", name: "Julia Kowalczyk",    color: "from-fuchsia-500 to-purple-600" },
]
