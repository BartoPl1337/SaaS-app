export const ACCENT_COLORS = [
  { id: "violet",  bg: "bg-violet-500",  ring: "ring-violet-400",  gradient: "from-violet-500 to-indigo-600" },
  { id: "sky",     bg: "bg-sky-500",     ring: "ring-sky-400",     gradient: "from-sky-500 to-cyan-600" },
  { id: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-400", gradient: "from-emerald-500 to-teal-600" },
  { id: "amber",   bg: "bg-amber-500",   ring: "ring-amber-400",   gradient: "from-amber-500 to-orange-500" },
  { id: "rose",    bg: "bg-rose-500",    ring: "ring-rose-400",    gradient: "from-rose-500 to-pink-600" },
  { id: "fuchsia", bg: "bg-fuchsia-500", ring: "ring-fuchsia-400", gradient: "from-fuchsia-500 to-purple-600" },
  { id: "slate",   bg: "bg-slate-600",   ring: "ring-slate-400",   gradient: "from-slate-600 to-slate-700" },
  { id: "teal",    bg: "bg-teal-500",    ring: "ring-teal-400",    gradient: "from-teal-500 to-cyan-600" },
] as const

export const ICONS = ["🚀", "⚡", "🎯", "💡", "🛠", "📦", "🌿", "🔥", "🎨", "📊", "🧩", "🌐"]

export function getAccentGradient(colorId: string | undefined) {
  return ACCENT_COLORS.find(c => c.id === colorId)?.gradient ?? ACCENT_COLORS[0].gradient
}
