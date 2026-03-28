"use client"

import * as React from "react"
import {
  User,
  Bell,
  Shield,
  Plug2,
  Camera,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Laptop,
  Computer,
  TriangleAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// ─── Nav ─────────────────────────────────────────────────────────────────────

type Section = "profil" | "powiadomienia" | "bezpieczenstwo" | "integracje"

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "profil",         label: "Profil",         icon: <User   className="size-4" /> },
  { id: "powiadomienia",  label: "Powiadomienia",  icon: <Bell   className="size-4" /> },
  { id: "bezpieczenstwo", label: "Bezpieczeństwo", icon: <Shield className="size-4" /> },
  { id: "integracje",     label: "Integracje",     icon: <Plug2  className="size-4" /> },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FieldRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card shadow-xs ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border/50 px-5 py-3">
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  )
}

// ─── Profil ───────────────────────────────────────────────────────────────────

function ProfilSection() {
  const [name,  setName]  = React.useState("Bartosz Brodziak")
  const [email, setEmail] = React.useState("bartosz@xyz.com")
  const [bio,   setBio]   = React.useState("Full-stack developer. Buduję ProductHub od zera.")
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("light")
  const [saved, setSaved] = React.useState(false)

  const THEMES: { id: typeof theme; label: string; icon: React.ReactNode }[] = [
    { id: "light",  label: "Jasny",  icon: <Sun     className="size-3.5" /> },
    { id: "dark",   label: "Ciemny", icon: <Moon    className="size-3.5" /> },
    { id: "system", label: "System", icon: <Monitor className="size-3.5" /> },
  ]

  const RECOMMENDED = [
    { id: "github", name: "GitHub",      desc: "Połącz repozytoria z zadaniami.", color: "bg-slate-900 text-white", icon: <Computer className="size-4" /> },
    { id: "slack",  name: "Slack",       desc: "Powiadomienia na Slack.",         color: "bg-[#4A154B] text-white", icon: <Computer className="size-4" /> },
    { id: "figma",  name: "Figma",       desc: "Osadzaj projekty Figma.",         color: "bg-[#F24E1E] text-white", icon: <Computer className="size-4" /> },
  ]

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Profil" description="Twoje dane widoczne dla innych członków zespołu." />

      {/* Avatar + basic info */}
      <Card>
        {/* Avatar row */}
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

        {/* Fields */}
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

      {/* Theme */}
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
                {React.cloneElement(t.icon as React.ReactElement<{ className: string }>, { className: "size-5" })}
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

      {/* Recommended integrations */}
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
                  {int.icon}
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

      {/* Danger zone */}
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

// ─── Powiadomienia ────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [settings, setSettings] = React.useState({
    taskAssigned:  true,
    taskComment:   true,
    taskDue:       true,
    taskCompleted: false,
    boardInvite:   true,
    weeklyDigest:  false,
    mentions:      true,
    statusChange:  false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  const rows: { key: keyof typeof settings; label: string; description: string }[] = [
    { key: "taskAssigned",  label: "Przypisanie zadania",    description: "Gdy zadanie zostanie Ci przypisane." },
    { key: "taskComment",   label: "Nowy komentarz",         description: "Gdy ktoś skomentuje Twoje zadanie." },
    { key: "mentions",      label: "Wzmianki @",             description: "Gdy ktoś oznaczy Cię w komentarzu." },
    { key: "taskDue",       label: "Zbliżający się termin",  description: "24 godziny przed upływem terminu." },
    { key: "taskCompleted", label: "Ukończenie zadania",     description: "Gdy zadanie zostanie oznaczone jako gotowe." },
    { key: "statusChange",  label: "Zmiana statusu",         description: "Gdy zmieni się status zadania." },
    { key: "boardInvite",   label: "Zaproszenie do tablicy", description: "Gdy zostaniesz dodany do nowej tablicy." },
    { key: "weeklyDigest",  label: "Tygodniowe podsumowanie",description: "E-mail z podsumowaniem aktywności w piątek." },
  ]

  return (
    <div>
      <SectionTitle title="Powiadomienia" description="Wybierz o czym chcesz być informowany." />
      <Card>
        <div className="divide-y divide-border/40 px-5">
          {rows.map(row => (
            <FieldRow key={row.key} label={row.label} description={row.description}>
              <Switch checked={settings[row.key]} onCheckedChange={() => toggle(row.key)} />
            </FieldRow>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Bezpieczeństwo ───────────────────────────────────────────────────────────

function SecuritySection() {
  const [showPass, setShowPass] = React.useState(false)
  const [twofa, setTwofa] = React.useState(false)

  const sessions = [
    { device: "MacBook Pro 16", location: "Warszawa, PL", current: true,  last: "Teraz" },
    { device: "iPhone 15 Pro",  location: "Warszawa, PL", current: false, last: "2 godz. temu" },
    { device: "Chrome / Windows", location: "Kraków, PL", current: false, last: "3 dni temu" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Bezpieczeństwo" description="Zarządzaj hasłem, 2FA i aktywnymi sesjami." />

      {/* Password */}
      <Card>
        <CardTitle>Zmiana hasła</CardTitle>
        <div className="flex flex-col gap-3 px-5 py-4">
          {["Obecne hasło", "Nowe hasło", "Potwierdź nowe hasło"].map((label, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">{label}</label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} placeholder="••••••••" className="h-8 pr-9 text-sm" />
                <button
                  onClick={() => setShowPass(v => !v)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-border/50 px-5 py-3">
          <Button size="sm" className="h-8">Aktualizuj hasło</Button>
        </div>
      </Card>

      {/* 2FA */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Weryfikacja dwuetapowa</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Dodatkowa warstwa ochrony przy logowaniu.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={twofa ? "default" : "secondary"} className="h-5 rounded-full text-[10px]">
              {twofa ? "Aktywna" : "Nieaktywna"}
            </Badge>
            <Switch checked={twofa} onCheckedChange={setTwofa} />
          </div>
        </div>
      </Card>

      {/* Sessions */}
      <Card>
        <CardTitle>Aktywne sesje</CardTitle>
        <div className="divide-y divide-border/40">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Laptop className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{s.device}</p>
                    {s.current && (
                      <Badge variant="secondary" className="h-4 rounded-full px-1.5 text-[10px]">
                        Bieżąca
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{s.location} · {s.last}</p>
                </div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="xs" className="h-6 text-xs text-rose-500 hover:text-rose-600">
                  Wyloguj
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Integracje ───────────────────────────────────────────────────────────────

function IntegrationsSection() {
  const [connected, setConnected] = React.useState<Record<string, boolean>>({
    github: true, slack: false, figma: true, chrome: false,
  })

  const toggle = (key: string) => setConnected(p => ({ ...p, [key]: !p[key] }))

  const integrations = [
    { id: "github", name: "GitHub",      desc: "Połącz repozytoria i PR-y z zadaniami.",          color: "bg-slate-900 text-white" },
    { id: "slack",  name: "Slack",       desc: "Otrzymuj powiadomienia na kanałach Slack.",        color: "bg-[#4A154B] text-white" },
    { id: "figma",  name: "Figma",       desc: "Osadzaj projekty Figma bezpośrednio w tablicy.",   color: "bg-[#F24E1E] text-white" },
    { id: "chrome", name: "Chrome Ext.", desc: "Szybkie dodawanie zadań z przeglądarki.",          color: "bg-sky-500 text-white" },
  ]

  return (
    <div>
      <SectionTitle title="Integracje" description="Połącz ProjectHub z narzędziami których używasz." />
      <div className="flex flex-col gap-3">
        {integrations.map(int => (
          <Card key={int.id}>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${int.color}`}>
                  <Computer className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{int.name}</p>
                  <p className="text-xs text-muted-foreground">{int.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {connected[int.id] && (
                  <Badge variant="secondary" className="h-5 gap-1 rounded-full px-2 text-[10px]">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Połączono
                  </Badge>
                )}
                <Button
                  variant={connected[int.id] ? "outline" : "default"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toggle(int.id)}
                >
                  {connected[int.id] ? "Rozłącz" : "Połącz"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTIONS: Record<Section, React.ReactNode> = {
  profil:         <ProfilSection />,
  powiadomienia:  <NotificationsSection />,
  bezpieczenstwo: <SecuritySection />,
  integracje:     <IntegrationsSection />,
}

export default function SettingsPage() {
  const [active, setActive] = React.useState<Section>("profil")

  return (
    <div className="flex flex-1 gap-0 p-6">

      {/* Sidebar nav */}
      <nav className="mr-8 w-44 shrink-0">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ustawienia
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active === item.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span className={active === item.id ? "text-foreground" : "text-muted-foreground"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {SECTIONS[active]}
      </div>
    </div>
  )
}
