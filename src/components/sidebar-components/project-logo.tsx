"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function ProjectLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="group/logo flex items-center">
          <SidebarMenuButton size="lg" asChild>
            <a href="/">
              {isCollapsed ? (
                <img
                  src="/logoshape.svg"
                  alt="Logo"
                  className="size-5 shrink-0"
                />
              ) : (
                <img src="/logo.svg" alt="Logo" className="h-5 w-auto" />
              )}
            </a>
          </SidebarMenuButton>
          {isCollapsed ? (
            <SidebarTrigger className="absolute opacity-0 group-hover/logo:opacity-100 transition-opacity hover:bg-neutral-200" />
          ) : (
            <SidebarTrigger className="hover:bg-neutral-200" size="lg" />
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
