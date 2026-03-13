"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function ProjectLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <a href="/">
            {isCollapsed ? (
              // Logo icon only when collapsed
              <img
                src="/logoshape.svg"
                alt="Logo"
                className="size-8 shrink-0"
              />
            ) : (
              // Full logo with text when expanded
              <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
            )}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
