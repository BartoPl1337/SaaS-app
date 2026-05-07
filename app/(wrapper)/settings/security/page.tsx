"use client"

import * as React from "react"
import { Eye, EyeOff, Laptop, Smartphone, Tablet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth-client"
import { formatActivityTime } from "@/components/activity/activity-render"
import { Card, CardTitle, SectionTitle } from "../_components"

const MIN_PASSWORD_LENGTH = 8

interface SessionRecord {
  id: string
  token: string
  createdAt: string | Date
  updatedAt: string | Date
  expiresAt: string | Date
  ipAddress?: string | null
  userAgent?: string | null
}

type DeviceKind = "phone" | "tablet" | "laptop"

function parseUserAgent(ua: string | null | undefined): { device: string; browser: string; kind: DeviceKind } {
  if (!ua) return { device: "Nieznane urządzenie", browser: "—", kind: "laptop" }

  let kind: DeviceKind = "laptop"
  let device = "Komputer"
  if (/iPhone/i.test(ua))           { device = "iPhone";  kind = "phone" }
  else if (/iPad/i.test(ua))        { device = "iPad";    kind = "tablet" }
  else if (/Android/i.test(ua))     { device = /Mobile/i.test(ua) ? "Android" : "Android (tablet)"; kind = /Mobile/i.test(ua) ? "phone" : "tablet" }
  else if (/Macintosh|Mac OS X/i.test(ua)) device = "Mac"
  else if (/Windows/i.test(ua))     device = "Windows"
  else if (/Linux/i.test(ua))       device = "Linux"

  let browser = "Przeglądarka"
  if (/Edg\//i.test(ua))            browser = "Edge"
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera"
  else if (/Firefox/i.test(ua))     browser = "Firefox"
  else if (/Chrome/i.test(ua))      browser = "Chrome"
  else if (/Safari/i.test(ua))      browser = "Safari"

  return { device, browser, kind }
}

function deviceIcon(kind: DeviceKind) {
  if (kind === "phone")  return <Smartphone className="size-4 text-muted-foreground" />
  if (kind === "tablet") return <Tablet      className="size-4 text-muted-foreground" />
  return <Laptop className="size-4 text-muted-foreground" />
}

export default function BezpieczenstwoPage() {
  const [showPass, setShowPass] = React.useState(false)
  const [twofa,    setTwofa]    = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword,     setNewPassword]     = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [revokeOthers,    setRevokeOthers]    = React.useState(false)
  const [submitting,      setSubmitting]      = React.useState(false)

  const { data: activeSession } = authClient.useSession()
  const [sessions, setSessions]           = React.useState<SessionRecord[] | null>(null)
  const [sessionsLoading, setLoadingSess] = React.useState(true)
  const [revokingToken, setRevokingToken] = React.useState<string | null>(null)
  const [now] = React.useState(() => Date.now())

  const refreshSessions = React.useCallback(async () => {
    const { data, error } = await authClient.listSessions()
    if (error) {
      toast.error(error.message || "Nie udało się pobrać sesji")
      setSessions([])
    } else {
      setSessions((data ?? []) as unknown as SessionRecord[])
    }
    setLoadingSess(false)
  }, [])

  React.useEffect(() => {
    refreshSessions()
  }, [refreshSessions])

  async function handleRevokeSession(token: string) {
    setRevokingToken(token)
    const { error } = await authClient.revokeSession({ token })
    setRevokingToken(null)
    if (error) {
      toast.error(error.message || "Nie udało się wylogować sesji")
      return
    }
    toast.success("Sesja zakończona")
    await refreshSessions()
  }

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length > 0 &&
    !submitting

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Nowe hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Hasła nie są identyczne")
      return
    }
    if (newPassword === currentPassword) {
      toast.error("Nowe hasło musi być inne niż obecne")
      return
    }

    setSubmitting(true)
    await authClient.changePassword(
      {
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      },
      {
        onSuccess: () => {
          toast.success("Hasło zaktualizowane")
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
          setRevokeOthers(false)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Nie udało się zmienić hasła")
        },
      },
    )
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Bezpieczeństwo" description="Zarządzaj hasłem, 2FA i aktywnymi sesjami." />

      <Card>
        <CardTitle>Zmiana hasła</CardTitle>
        <form onSubmit={handleChangePassword}>
          <div className="flex flex-col gap-3 px-5 py-4">
            <PasswordField
              label="Obecne hasło"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showPass}
              onToggleShow={() => setShowPass(v => !v)}
              autoComplete="current-password"
            />
            <PasswordField
              label="Nowe hasło"
              value={newPassword}
              onChange={setNewPassword}
              show={showPass}
              onToggleShow={() => setShowPass(v => !v)}
              autoComplete="new-password"
              hint={`Co najmniej ${MIN_PASSWORD_LENGTH} znaków`}
            />
            <PasswordField
              label="Potwierdź nowe hasło"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showPass}
              onToggleShow={() => setShowPass(v => !v)}
              autoComplete="new-password"
              error={
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? "Hasła nie są identyczne"
                  : undefined
              }
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={revokeOthers}
                onCheckedChange={(v) => setRevokeOthers(v === true)}
              />
              Wyloguj z pozostałych urządzeń
            </label>
          </div>
          <div className="flex justify-end border-t border-border/50 px-5 py-3">
            <Button type="submit" size="sm" className="h-8" disabled={!canSubmit}>
              {submitting ? "Aktualizuję…" : "Aktualizuj hasło"}
            </Button>
          </div>
        </form>
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
          {sessionsLoading && (
            <div className="flex flex-col gap-2 px-5 py-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted/50" />
              ))}
            </div>
          )}

          {!sessionsLoading && sessions && sessions.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">
              Brak aktywnych sesji.
            </div>
          )}

          {!sessionsLoading && sessions?.map((s) => {
            const ua = parseUserAgent(s.userAgent)
            const isCurrent = !!activeSession?.session && s.token === activeSession.session.token
            const lastActiveTs = new Date(s.updatedAt).getTime()
            return (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    {deviceIcon(ua.kind)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {ua.device} · {ua.browser}
                      </p>
                      {isCurrent && (
                        <Badge variant="secondary" className="h-4 rounded-full px-1.5 text-[10px]">Bieżąca</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress ? `${s.ipAddress} · ` : ""}{formatActivityTime(lastActiveTs, now)}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 text-xs text-rose-500 hover:text-rose-600"
                    onClick={() => handleRevokeSession(s.token)}
                    disabled={revokingToken === s.token}
                  >
                    {revokingToken === s.token ? "…" : "Wyloguj"}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete?: string
  hint?: string
  error?: string
}

function PasswordField({ label, value, onChange, show, onToggleShow, autoComplete, hint, error }: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="h-8 pr-9 text-sm"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
        >
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
      {error ? (
        <p className="text-[11px] text-rose-500">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
