"use client"

import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DialogFooterProps {
  step: number
  total: number
  canNext: boolean
  submitting?: boolean
  onBack: () => void
  onNext: () => void
  onCreate: () => void
}

export function DialogFooter({ step, total, canNext, submitting, onBack, onNext, onCreate }: DialogFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground"
        onClick={onBack}
        disabled={submitting}
      >
        <ChevronLeft className="size-3.5" />
        {step === 1 ? "Anuluj" : "Wstecz"}
      </Button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i + 1 === step ? "w-5 bg-foreground" : i + 1 < step ? "w-1.5 bg-foreground/40" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {step < total ? (
        <Button
          size="sm"
          className="h-8 gap-1.5"
          disabled={!canNext}
          onClick={onNext}
        >
          Dalej
          <ChevronRight className="size-3.5" />
        </Button>
      ) : (
        <Button size="sm" className="h-8 gap-1.5" onClick={onCreate} disabled={submitting}>
          {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {submitting ? "Tworzenie..." : "Utwórz projekt"}
        </Button>
      )}
    </div>
  )
}
