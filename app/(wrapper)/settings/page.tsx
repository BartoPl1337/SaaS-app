"use client"

import * as React from "react"
import { Camera, Check, Sun, Moon, Monitor, Computer, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardTitle, FieldRow, SectionTitle } from "./_components"

const THEMES = [
  { id: "light",  label: "Jasny",  icon: Sun     },
  { id: "dark",   label: "Ciemny", icon: Moon    },
  { id: "system", label: "System", icon: Monitor },
] as const

const RECOMMENDED = [
  { id: "github", name: "GitHub", desc: "Połącz repozytoria z zadaniami.",  color: "bg-slate-900 text-white" },
  { id: "slack",  name: "Slack",  desc: "Powiadomienia na Slack.",          color: "bg-[#4A154B] text-white" },
  { id: "figma",  name: "Figma",  desc: "Osadzaj projekty Figma.",          color: "bg-[#F24E1E] text-white" },
]

export default function ProfilPage() {
  const [name,  setName]  = React.useState("Bartosz Brodziak")
  const [email, setEmail] = React.useState("bartosz@xyz.com")
  const [bio,   setBio]   = React.useState("Full-stack developer. Buduję ProductHub od zera.")
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("light")
  const [saved, setSaved] = React.useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Profil" description="Twoje dane widoczne dla innych członków zespołu." />

      <Card>
        <div className="flex items-center gap-5 border-b border-border/50 p-5">
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-bold text-white">
              BB
            </div>
            <button className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-xs hover:bg-muted">
              <Camera className="size-3 text-muted-foreground" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Zdjęcie profilowe</p>
            <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG lub GIF · maks. 2 MB</p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="xs" className="h-6 text-xs">Prześlij</Button>
              <Button variant="ghost"   size="xs" className="h-6 text-xs text-muted-foreground">Usuń</Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/40 px-5">
          <FieldRow label="Imię i nazwisko">
            <Input value={name} onChange={e => setName(e.target.value)} className="h-8 w-56 text-sm" />
          </FieldRow>
          <FieldRow label="Adres e-mail" description="Używany do logowania i powiadomień.">
            <Input value={email} onChange={e => setEmail(e.target.value)} className="h-8 w-56 text-sm" />
          </FieldRow>
          <FieldRow label="Bio" description="Krótki opis widoczny w profilu.">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={2}
              className="w-56 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </FieldRow>
        </div>

        <div className="flex justify-end border-t border-border/50 px-5 py-3">
          <Button size="sm" className="h-8 gap-1.5" onClick={save}>
            {saved ? <><Check className="size-3.5" />Zapisano</> : "Zapisz zmiany"}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Motyw interfejsu</CardTitle>
        <div className="grid grid-cols-3 gap-3 p-4">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative flex flex-col items-center gap-3 rounded-xl border py-5 text-sm font-medium transition-all ${
                theme === t.id
                  ? "border-foreground/20 bg-muted text-foreground shadow-xs ring-2 ring-foreground/10"
                  : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              <span className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                theme === t.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}>
                <t.icon className="size-5" />
              </span>
              {t.label}
              {theme === t.id && (
                <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-foreground">
                  <Check className="size-2.5 text-background" />
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Rekomendowane integracje</p>
          <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Zobacz więcej →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {RECOMMENDED.map(int => (
            <button
              key={int.id}
              className="group flex flex-col items-start gap-4 rounded-xl border border-border/60 bg-card p-4 text-left shadow-xs transition-all hover:border-border hover:shadow-md"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${int.color}`}>
                  <Computer className="size-4" />
                </div>
                <span className="mt-0.5 rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Darmowa
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{int.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{int.desc}</p>
              </div>
              <span className="text-xs font-medium text-foreground underline-offset-2 group-hover:underline">
                Połącz →
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card className="border-rose-200">
        <div className="flex items-center gap-2 border-b border-rose-100 px-5 py-3">
          <TriangleAlert className="size-3.5 text-rose-500" />
          <p className="text-sm font-semibold text-rose-600">Strefa niebezpieczna</p>
        </div>
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Usuń konto</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Trwale usuwa Twoje konto i odłącza je od wszystkich obszarów roboczych. Tego nie można cofnąć.
            </p>
          </div>
          <Button variant="destructive" size="sm" className="h-8 shrink-0 text-xs">
            Usuń konto
          </Button>
        </div>
      </Card>
    </div>
  )
}
