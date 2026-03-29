import * as React from "react"

export function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function FieldRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card shadow-xs ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border/50 px-5 py-3">
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  )
}
