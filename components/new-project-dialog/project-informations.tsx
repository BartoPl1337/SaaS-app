"use client"

import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ACCENT_COLORS, ICONS } from "./constants"

interface ProjectInformationsProps {
  name: string
  setName: (v: string) => void
  description: string
  setDescription: (v: string) => void
  accent: string
  setAccent: (v: string) => void
  icon: string
  setIcon: (v: string) => void
}

export function ProjectInformations({
  name, setName,
  description, setDescription,
  accent, setAccent,
  icon, setIcon,
}: ProjectInformationsProps) {
  const selectedAccent = ACCENT_COLORS.find(c => c.id === accent) ?? ACCENT_COLORS[0]

  return (
    <div className="flex flex-col gap-5">
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
