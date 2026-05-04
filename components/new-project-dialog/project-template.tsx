"use client"

import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TEMPLATES } from "./constants"

interface ProjectTemplateProps {
  template: string
  setTemplate: (v: string) => void
}

export function ProjectTemplate({ template, setTemplate }: ProjectTemplateProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Wybierz strukturę która najlepiej pasuje do sposobu pracy Twojego zespołu.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              template === t.id
                ? "border-foreground/20 bg-muted ring-2 ring-foreground/10"
                : "border-border/60 hover:border-border hover:bg-muted/30"
            }`}
          >
            {template === t.id && (
              <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-foreground">
                <Check className="size-3 text-background" />
              </span>
            )}
            <span className={`flex size-10 items-center justify-center rounded-xl ${t.color}`}>
              {t.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {t.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="h-4 rounded-full px-1.5 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
