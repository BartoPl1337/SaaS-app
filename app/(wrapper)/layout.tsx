import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { isAuthenticated } from "@/lib/auth-server"
import { redirect } from "next/navigation"

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/signIn");
  }
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppNavbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
