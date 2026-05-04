"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { ArrowRight } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  ActivityRecord,
  activityUserGradient,
  activityUserInitials,
  activityUserName,
  formatActivityTime,
  getActivityConfig,
} from "@/components/activity/activity-render"

interface RecentActivityCardProps {
  limit?: number
}

export function RecentActivityCard({ limit = 7 }: RecentActivityCardProps) {
  const activities = useQuery(api.activity.listForUser, { limit }) as
    | ActivityRecord[]
    | undefined

  const [now] = React.useState(() => Date.now())

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card shadow-xs">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Ostatnia aktywność</h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link href="/activity">
            Zobacz wszystkie <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col">
        {activities === undefined && (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted/50" />
            ))}
          </div>
        )}

        {activities && activities.length === 0 && (
          <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            Brak aktywności.
          </div>
        )}

        {activities && activities.length > 0 && (
          <ul className="flex flex-col">
            {activities.map((item) => {
              const cfg = getActivityConfig(item.type)
              const name = activityUserName(item.user)
              return (
                <li
                  key={item._id}
                  className="flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-0"
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activityUserGradient(item.userId)} text-[10px] font-bold text-white`}
                  >
                    {activityUserInitials(item.user)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug text-muted-foreground">
                      {cfg.render(item, name)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                      {formatActivityTime(item._creationTime, now)}
                    </p>
                  </div>
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}
                    aria-hidden
                  >
                    {cfg.icon}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
