import * as React from "react"
import { Check } from "lucide-react"

const STEP_LABELS = ["Podstawowe info", "Szablon", "Zespół"]

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  done
                    ? "border-foreground bg-foreground text-background"
                    : active
                    ? "border-foreground bg-background text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-3.5" /> : step}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`mb-4 h-px w-16 transition-colors ${
                  step < current ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
