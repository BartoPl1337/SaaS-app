"use client"

import * as React from "react"
import { Computer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, SectionTitle } from "../_components"

const INTEGRATIONS = [
  { id: "github", name: "GitHub",      desc: "Połącz repozytoria i PR-y z zadaniami.",         color: "bg-slate-900 text-white" },
  { id: "slack",  name: "Slack",       desc: "Otrzymuj powiadomienia na kanałach Slack.",       color: "bg-[#4A154B] text-white" },
  { id: "figma",  name: "Figma",       desc: "Osadzaj projekty Figma bezpośrednio w tablicy.",  color: "bg-[#F24E1E] text-white" },
  { id: "chrome", name: "Chrome Ext.", desc: "Szybkie dodawanie zadań z przeglądarki.",         color: "bg-sky-500 text-white"   },
]

export default function IntegracjePage() {
  const [connected, setConnected] = React.useState<Record<string, boolean>>({
    github: true, slack: false, figma: true, chrome: false,
  })

  const toggle = (id: string) => setConnected(p => ({ ...p, [id]: !p[id] }))

  return (
    <div>
      <SectionTitle title="Integracje" description="Połącz ProjectHub z narzędziami których używasz." />
      <div className="flex flex-col gap-3">
        {INTEGRATIONS.map(int => (
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
