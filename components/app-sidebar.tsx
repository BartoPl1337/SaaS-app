"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Activity,
  Users,
  Settings,
  Bell,
  ChevronUp,
  Plus,
  AlarmClockCheck,
  LogOutIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { NotificationsPopover } from "@/components/notifications-popover"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"

const navItems = [
  {
    label: "Panel główny",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Tablica",
    icon: Kanban,
    href: "/boards",
    badge: null,
  },
  {
    label: "Moje zadania",
    icon: CheckSquare,
    href: "/tasks",
    badge: "5",
  },
  {
    label: "Aktywność",
    icon: Activity,
    href: "/activity",
    badge: null,
  },
  {
    label: "Członkowie",
    icon: Users,
    href: "/members",
    badge: null,
  },
]

export function AppSidebar() {
  const [newProjectOpen, setNewProjectOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
        {/* Header */}
        <SidebarHeader className="px-3 py-4">
          <div className="flex items-center gap-3 px-1">
            <Link href="/" className={cn("flex size-8 items-center justify-center text-sidebar-primary-foreground", isCollapsed ? "p-1" : "p-2 rounded-md bg-black")}>
              <AlarmClockCheck className={cn(isCollapsed ? "size-4 text-black" : "size-5")} />
            </Link>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  TaskHub
                </span>
                <span className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-widest">
                  Workspace
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Main nav */}
        <SidebarContent className="px-1 py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      size="default"
                      className={cn("relative h-9 rounded-lg transition-all duration-150", pathname === item.href ? "bg-primary/20" : "")}
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        {item.badge && !isCollapsed && (
                          <SidebarMenuBadge className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sidebar-primary/10 px-1.5 text-[10px] font-semibold text-sidebar-primary">
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bottom nav group */}
          <SidebarGroup className="mt-auto">
            <div className="group-data-[collapsible=icon]:hidden">
              <Button
                variant="outline"
                className="w-full gap-1.5 border-dashed text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
                onClick={() => setNewProjectOpen(true)}
              >
                <Plus className="size-3.5" />
                Nowy projekt
              </Button>
            </div>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarSeparator />
        <SidebarFooter className="px-2 py-3">
          <div
            className={`flex items-center gap-2 ${isCollapsed ? "flex-col" : "flex-row"}`}
          >
            {/* Profile button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`group relative h-9 flex-1 items-center gap-2.5 rounded-lg px-2 text-left transition-all duration-150 hover:bg-sidebar-accent ${isCollapsed ? "w-full justify-center px-0" : "justify-start"}`}
                >
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-xs font-semibold text-sidebar-foreground">
                        Bartosz B.
                      </span>
                      <span className="truncate text-[10px] text-sidebar-foreground/50">
                        Admin
                      </span>
                    </div>
                  )}
                  {!isCollapsed && (
                    <ChevronUp className="ml-auto size-3.5 shrink-0 text-sidebar-foreground/40 transition-transform group-hover:text-sidebar-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings /> Ustawienia
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification button */}
            <NotificationsPopover side="left" align="end">
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative size-9 shrink-0 rounded-lg text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-sidebar" />
              </Button>
            </NotificationsPopover>
          </div>
        </SidebarFooter>
      </Sidebar>

      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </>
  )
}
