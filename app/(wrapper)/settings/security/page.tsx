"use client"

import * as React from "react"
import { Eye, EyeOff, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardTitle, SectionTitle } from "../_components"

const SESSIONS = [
  { device: "MacBook Pro 16",   location: "Warszawa, PL", current: true,  last: "Teraz"        },
  { device: "iPhone 15 Pro",    location: "Warszawa, PL", current: false, last: "2 godz. temu" },
  { device: "Chrome / Windows", location: "Kraków, PL",   current: false, last: "3 dni temu"   },
]

const PASSWORD_FIELDS = ["Obecne hasło", "Nowe hasło", "Potwierdź nowe hasło"]

export default function BezpieczenstwoPage() {
  const [showPass, setShowPass] = React.useState(false)
  const [twofa,    setTwofa]    = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Bezpieczeństwo" description="Zarządzaj hasłem, 2FA i aktywnymi sesjami." />

      <Card>
        <CardTitle>Zmiana hasła</CardTitle>
        <div className="flex flex-col gap-3 px-5 py-4">
          {PASSWORD_FIELDS.map(label => (
            <div key={label} className="flex flex-col gap-1.5">
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

      <Card>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Weryfikacja dwuetapowa</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Dodatkowa warstwa ochrony przy logowaniu.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={twofa ? "default" : "secondary"} className="h-5 rounded-full text-[10px]">
              {twofa ? "Aktywna" : "Nieaktywna"}
            </Badge>
            <Switch checked={twofa} onCheckedChange={setTwofa} />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Aktywne sesje</CardTitle>
        <div className="divide-y divide-border/40">
          {SESSIONS.map(s => (
            <div key={s.device} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Laptop className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{s.device}</p>
                    {s.current && (
                      <Badge variant="secondary" className="h-4 rounded-full px-1.5 text-[10px]">Bieżąca</Badge>
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
