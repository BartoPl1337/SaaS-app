"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bell, Shield, Plug2 } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/settings",         label: "Profil",         icon: User   },
  { href: "/settings/notifications",  label: "Powiadomienia",  icon: Bell   },
  { href: "/settings/security", label: "Bezpieczeństwo", icon: Shield },
  { href: "/settings/integrations",     label: "Integracje",     icon: Plug2  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-1 gap-0 p-6">
      <nav className="mr-8 w-44 shrink-0">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ustawienia
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("size-4", active ? "text-foreground" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  )
}
