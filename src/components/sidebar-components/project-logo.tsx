"use client";

import { NavLink } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";

export function ProjectLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="group/logo flex items-center">
          <SidebarMenuButton size="lg" asChild>
            <NavLink to="/">
              {isCollapsed ? (
                <img
                  src="/logoshape.svg"
                  alt="Logo"
                  className="size-5 shrink-0"
                />
              ) : (
                <img src="/logo.svg" alt="Logo" className="h-5 w-auto" />
              )}
            </NavLink>
          </SidebarMenuButton>
          {isCollapsed ? (
            <SidebarTrigger className="absolute opacity-0 group-hover/logo:opacity-100 transition-opacity hover:bg-neutral-200" />
          ) : (
            <SidebarTrigger className="hover:bg-neutral-200 cursor-pointer" size="lg" />
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
