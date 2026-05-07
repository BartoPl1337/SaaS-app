"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, FieldRow, SectionTitle } from "../_components"

type Key =
  | "taskAssigned"
  | "taskComment"
  | "mentions"
  | "taskDue"
  | "taskCompleted"
  | "statusChange"
  | "boardInvite"
  | "weeklyDigest"

const ROWS: { key: Key; label: string; description: string; soon?: boolean }[] = [
  { key: "taskAssigned",  label: "Przypisanie zadania",     description: "Gdy zadanie zostanie Ci przypisane." },
  { key: "taskComment",   label: "Nowy komentarz",          description: "Gdy ktoś skomentuje Twoje zadanie.",            soon: true },
  { key: "mentions",      label: "Wzmianki @",              description: "Gdy ktoś oznaczy Cię w komentarzu.",            soon: true },
  { key: "taskDue",       label: "Zbliżający się termin",   description: "24 godziny przed upływem terminu.",             soon: true },
  { key: "taskCompleted", label: "Ukończenie zadania",      description: "Gdy Twoje zadanie zostanie oznaczone jako gotowe." },
  { key: "statusChange",  label: "Zmiana statusu",          description: "Gdy zmieni się status Twojego zadania.",        soon: true },
  { key: "boardInvite",   label: "Zaproszenie do projektu", description: "Gdy zostaniesz dodany do nowego projektu." },
  { key: "weeklyDigest",  label: "Tygodniowe podsumowanie", description: "E-mail z podsumowaniem aktywności w piątek.",   soon: true },
]

const FALLBACK: Record<Key, boolean> = {
  taskAssigned: true, taskComment: true, mentions: true,
  taskDue: true, taskCompleted: false, statusChange: false,
  boardInvite: true, weeklyDigest: false,
}

export default function PowiadomieniaPage() {
  const prefs = useQuery(api.notifications.getPrefs)
  const updatePrefs = useMutation(api.notifications.updatePrefs)

  const [pending, setPending] = React.useState<Set<Key>>(new Set())

  const settings = (prefs ?? FALLBACK) as Record<Key, boolean>
  const loading = prefs === undefined

  async function toggle(key: Key, label: string) {
    if (loading) return
    const next = !settings[key]
    setPending((p) => new Set(p).add(key))
    try {
      await updatePrefs({ [key]: next })
      toast.success(next ? `Włączono: ${label}` : `Wyłączono: ${label}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zapisać")
    } finally {
      setPending((p) => {
        const n = new Set(p)
        n.delete(key)
        return n
      })
    }
  }

  return (
    <div>
      <SectionTitle title="Powiadomienia" description="Wybierz o czym chcesz być informowany." />
      <Card>
        <div className="divide-y divide-border/40 px-5">
          {ROWS.map((row) => (
            <FieldRow
              key={row.key}
              label={
                row.soon ? (
                  <span className="flex items-center gap-2">
                    {row.label}
                    <Badge variant="secondary" className="h-4 rounded-full px-1.5 text-[10px] font-medium text-muted-foreground">
                      Wkrótce
                    </Badge>
                  </span>
                ) : (
                  row.label
                )
              }
              description={row.description}
            >
              <Switch
                checked={settings[row.key]}
                onCheckedChange={() => toggle(row.key, row.label)}
                disabled={loading || pending.has(row.key)}
              />
            </FieldRow>
          ))}
        </div>
      </Card>
    </div>
  )
}
