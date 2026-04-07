"use client";

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  User2Icon,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <SidebarGroup className="flex-1 flex items-center justify-center group-data-[collapsible=icon]:hidden">
        <div className="mx-3 p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <User2Icon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-800">
              Sign in to save history
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your conversations will appear here
            </p>
          </div>
          <Button
            onClick={() => navigate("/login")}
            className="w-full h-8 text-xs rounded-lg cursor-pointer"
          >
            Sign in
          </Button>
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem
            key={item.name}
            className="hover:bg-neutral-200 rounded-lg cursor-pointer"
          >
            <SidebarMenuButton asChild className="hover:bg-neutral-200">
              <a href={item.url}>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal className="cursor-pointer" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="cursor-pointer [&:hover]:bg-neutral-200">
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer [&:hover]:bg-neutral-200">
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer [&:hover]:bg-neutral-200">
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
