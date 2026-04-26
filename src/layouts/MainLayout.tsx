import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GuestHeader } from "@/components/GuestHeader";

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <GuestHeader />
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-4">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 px-3 md:hidden">
          <SidebarTrigger className="h-8 w-8" />
        </header>
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
