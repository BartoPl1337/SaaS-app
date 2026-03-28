"use client"

import * as React from "react"
import { Search, Bell, HelpCircle, Clock, Bookmark, Plus, CommandIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar"

export function AppNavbar() {
  const [activeFilter, setActiveFilter] = React.useState<"recent" | "starred" | null>(null)

  return (
    <header className="flex h-13 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">

      <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mr-1 h-4" />

      {/* Left side */}
      <div className="flex flex-1 items-center gap-1.5">

        {/* Search */}
        <div className="relative flex max-w-xs flex-1 items-center">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Szukaj..."
            className="h-8 w-full rounded-lg border-border/50 bg-muted/40 pl-8 text-sm placeholder:text-muted-foreground/50 focus-visible:bg-background focus-visible:ring-1"
          />
          <KbdGroup className="pointer-events-none absolute right-2 hidden sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>

        <Separator orientation="vertical" className="mx-1 h-4" />

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
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative size-8 text-muted-foreground hover:text-foreground"
          aria-label="Powiadomienia"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500 ring-1 ring-background" />
        </Button>

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
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-full p-0"
          aria-label="Profil"
        >
          <Avatar size="sm" className="size-7">
            <AvatarImage src="" alt="Bartosz B." />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white">
              BB
            </AvatarFallback>
            <AvatarBadge className="bg-emerald-500 ring-background" />
          </Avatar>
        </Button>

      </div>
    </header>
  )
}
