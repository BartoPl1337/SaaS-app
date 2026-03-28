"use client"

import * as React from "react"
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

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "#dashboard",
    active: true,
  },
  {
    label: "Boards",
    icon: Kanban,
    href: "#boards",
    badge: null,
  },
  {
    label: "My Tasks",
    icon: CheckSquare,
    href: "#my-tasks",
    badge: "5",
  },
  {
    label: "Activity",
    icon: Activity,
    href: "#activity",
    badge: null,
  },
  {
    label: "Members",
    icon: Users,
    href: "#members",
    badge: null,
  },
]

const bottomItems = [
  {
    label: "Settings",
    icon: Settings,
    href: "#settings",
  },
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("Dashboard")
  const [newProjectOpen, setNewProjectOpen] = React.useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
        {/* Header */}
        <SidebarHeader className="px-3 py-4">
          <div className="flex items-center gap-3 px-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  ProjectHub
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
                      isActive={activeItem === item.label}
                      onClick={() => setActiveItem(item.label)}
                      tooltip={item.label}
                      size="default"
                      className="relative h-9 rounded-lg transition-all duration-150"
                    >
                      <item.icon className="shrink-0" />
                      <span>{item.label}</span>
                      {item.badge && !isCollapsed && (
                        <SidebarMenuBadge className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sidebar-primary/10 px-1.5 text-[10px] font-semibold text-sidebar-primary">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bottom nav group */}
          <SidebarGroup className="mt-auto">
            <div className="px-1 pb-2 group-data-[collapsible=icon]:hidden">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-1.5 border-dashed text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={() => setNewProjectOpen(true)}
              >
                <Plus className="size-3.5 shrink-0" />
                Nowy projekt
              </Button>
            </div>
            <SidebarSeparator className="mb-2" />
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={activeItem === item.label}
                      onClick={() => setActiveItem(item.label)}
                      tooltip={item.label}
                      size="default"
                      className="h-9 rounded-lg transition-all duration-150"
                    >
                      <item.icon className="shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarSeparator />
        <SidebarFooter className="px-2 py-3">
          <div
            className={`flex items-center gap-2 ${isCollapsed ? "flex-col" : "flex-row"}`}
          >
            {/* Profile button */}
            <Button
              variant="ghost"
              className={`group relative h-9 flex-1 items-center gap-2.5 rounded-lg px-2 text-left transition-all duration-150 hover:bg-sidebar-accent ${isCollapsed ? "w-full justify-center px-0" : "justify-start"}`}
            >
              <div className="relative shrink-0">
                <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                  BB
                </div>
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
              </div>
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
