"use client"

import { Bell, HelpCircle, Clock, Bookmark, Plus, CommandIcon, LogOutIcon, User, Shield, Plug2 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GlobalSearch } from "@/components/global-search"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"
import { DropdownMenu, DropdownMenuGroup, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Id } from "@/convex/_generated/dataModel"

export function AppNavbar() {
  const [activeFilter, setActiveFilter] = useState<"recent" | "starred" | null>(null)
  const [createTaskOpen, setCreateTaskOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
  const defaultWorkspaceId = projectMatch ? (projectMatch[1] as Id<"workspaces">) : undefined
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0

  return (
    <>
      <header className="flex h-13 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">

        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="my-2" />

        {/* Left side */}
        <div className="flex flex-1 items-center">

          {/* Search */}
          <GlobalSearch />

          <Separator orientation="vertical" className="ml-2" />

          {/* Filter buttons */}
          <Button
            variant={activeFilter === "recent" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setActiveFilter(activeFilter === "recent" ? null : "recent")}
          >
            <Clock className="size-3.5" />
            Ostatnie
          </Button>

          <Button
            variant={activeFilter === "starred" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setActiveFilter(activeFilter === "starred" ? null : "starred")}
          >
            <Bookmark className="size-3.5" />
            Oznaczone
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">

          {/* Notification */}
          <NotificationsPopover side="bottom" align="end">
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative size-8 text-muted-foreground hover:text-foreground"
              aria-label="Powiadomienia"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500 ring-1 ring-background" />
              )}
            </Button>
          </NotificationsPopover>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Pomoc"
          >
            <HelpCircle className="size-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1.5 h-4" />

          {/* Create task */}
          <Button
            size="sm"
            className="h-8 gap-2 pl-2.5 pr-2 font-medium"
            onClick={() => setCreateTaskOpen(true)}
          >
            <Plus className="size-3.5 shrink-0" />
            <span>Utwórz zadanie</span>
            <KbdGroup className="ml-0.5 hidden sm:flex">
              <Kbd className="bg-primary-foreground/20 text-primary-foreground/80">
                <CommandIcon className="size-3" />
              </Kbd>
              <Kbd className="bg-primary-foreground/20 text-primary-foreground/80">K</Kbd>
            </KbdGroup>
          </Button>

          {/* Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-full p-0"
                aria-label="Profil"
              >
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="Bartosz B." />
                  <AvatarFallback>
                    BB
                  </AvatarFallback>
                  <AvatarBadge className="bg-emerald-500 ring-background" />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/notifications">
                    <Bell />
                    Powiadomienia
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/security">
                    <Shield />
                    Bezpieczeństwo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/integrations">
                    <Plug2 />
                    Integracje
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOutIcon />
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div >
      </header >

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        defaultWorkspaceId={defaultWorkspaceId}
      />
    </>
  )
}
