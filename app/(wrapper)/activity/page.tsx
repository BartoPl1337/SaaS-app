"use client"

import * as React from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Separator } from "@/components/ui/separator"
import {
  ActivityRecord,
  activityUserGradient,
  activityUserInitials,
  activityUserName,
  formatActivityTime,
  getActivityConfig,
  timeBucketKey,
} from "@/components/activity/activity-render"

const GROUP_LABELS: Record<"today" | "yesterday" | "week" | "older", string> = {
  today: "Dzisiaj",
  yesterday: "Wczoraj",
  week: "Zeszły tydzień",
  older: "Wcześniej",
}

function ActivityGroup({
  label,
  items,
  now,
}: {
  label: string
  items: ActivityRecord[]
  now: number
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="flex-1">
          <Separator />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground/60">
          {items.length} zdarzeń
        </span>
      </div>

      <div className="flex flex-col">
        {items.map((item, i) => {
          const cfg = getActivityConfig(item.type)
          const name = activityUserName(item.user)
          return (
            <div key={item._id} className="group flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}>
                  {cfg.icon}
                </div>
                {i < items.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-border/50" style={{ minHeight: "1.5rem" }} />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col pb-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activityUserGradient(item.userId)} text-[9px] font-bold text-white ring-2 ring-background`}
                  >
                    {activityUserInitials(item.user)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {cfg.render(item, name)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                      {formatActivityTime(item._creationTime, now)}
                      {item.workspace && (
                        <>
                          {" · "}
                          {item.workspace.icon ? `${item.workspace.icon} ` : ""}
                          {item.workspace.name}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ActivityPage() {
  const activities = useQuery(api.activity.listForUser, { limit: 200 }) as
    | ActivityRecord[]
    | undefined

  const [now] = React.useState(() => Date.now())

  const grouped = React.useMemo(() => {
    const buckets = { today: [], yesterday: [], week: [], older: [] } as Record<
      "today" | "yesterday" | "week" | "older",
      ActivityRecord[]
    >
    for (const a of activities ?? []) {
      buckets[timeBucketKey(a._creationTime, now)].push(a)
    }
    return buckets
  }, [activities, now])

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Aktywność obszaru roboczego
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Śledź wszystko co dzieje się w Twoim obszarze roboczym.
          </p>
        </div>
        {activities && (
          <span className="mt-1 text-[11px] font-medium text-muted-foreground/60">
            {activities.length} zdarzeń łącznie
          </span>
        )}
      </div>

      {activities === undefined && (
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      )}

      {activities && activities.length === 0 && (
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-dashed border-border/60 px-6 py-16 text-center text-sm text-muted-foreground">
          Brak aktywności. Utwórz zadanie albo tablicę, aby zobaczyć tu zdarzenia.
        </div>
      )}

      {activities && activities.length > 0 && (
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-10">
          {(["today", "yesterday", "week", "older"] as const).map((key) =>
            grouped[key].length > 0 ? (
              <ActivityGroup
                key={key}
                label={GROUP_LABELS[key]}
                items={grouped[key]}
                now={now}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
