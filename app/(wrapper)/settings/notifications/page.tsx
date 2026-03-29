"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Card, FieldRow, SectionTitle } from "../_components"

const ROWS = [
  { key: "taskAssigned",  label: "Przypisanie zadania",     description: "Gdy zadanie zostanie Ci przypisane." },
  { key: "taskComment",   label: "Nowy komentarz",          description: "Gdy ktoś skomentuje Twoje zadanie." },
  { key: "mentions",      label: "Wzmianki @",              description: "Gdy ktoś oznaczy Cię w komentarzu." },
  { key: "taskDue",       label: "Zbliżający się termin",   description: "24 godziny przed upływem terminu." },
  { key: "taskCompleted", label: "Ukończenie zadania",      description: "Gdy zadanie zostanie oznaczone jako gotowe." },
  { key: "statusChange",  label: "Zmiana statusu",          description: "Gdy zmieni się status zadania." },
  { key: "boardInvite",   label: "Zaproszenie do tablicy",  description: "Gdy zostaniesz dodany do nowej tablicy." },
  { key: "weeklyDigest",  label: "Tygodniowe podsumowanie", description: "E-mail z podsumowaniem aktywności w piątek." },
] as const

type Key = (typeof ROWS)[number]["key"]

const DEFAULTS: Record<Key, boolean> = {
  taskAssigned: true, taskComment: true, mentions: true,
  taskDue: true, taskCompleted: false, statusChange: false,
  boardInvite: true, weeklyDigest: false,
}

export default function PowiadomieniaPage() {
  const [settings, setSettings] = React.useState(DEFAULTS)
  const toggle = (key: Key) => setSettings(p => ({ ...p, [key]: !p[key] }))

  return (
    <div>
      <SectionTitle title="Powiadomienia" description="Wybierz o czym chcesz być informowany." />
      <Card>
        <div className="divide-y divide-border/40 px-5">
          {ROWS.map(row => (
            <FieldRow key={row.key} label={row.label} description={row.description}>
              <Switch checked={settings[row.key]} onCheckedChange={() => toggle(row.key)} />
            </FieldRow>
          ))}
        </div>
      </Card>
    </div>
  )
}
