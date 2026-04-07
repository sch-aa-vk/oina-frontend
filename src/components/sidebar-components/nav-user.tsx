import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      // <SidebarMenu>
      //   <SidebarMenuItem>
      //     <SidebarMenuButton
      //       size="lg"
      //       onClick={() => navigate("/login")}
      //       className="hover:cursor-pointer hover:bg-neutral-200 transition-colors duration-200"
      //     >
      //       <Avatar className="h-8 w-8 rounded-lg">
      //         <AvatarFallback className="rounded-lg">
      //           <User2Icon />
      //         </AvatarFallback>
      //       </Avatar>
      //       <div className="grid flex-1 text-left text-sm leading-tight">
      //         <span className="truncate font-medium">Sign in</span>
      //         <span className="truncate text-xs text-muted-foreground">
      //           to access your account
      //         </span>
      //       </div>
      //       {/* <ChevronsUpDown className="ml-auto size-4" /> */}
      //     </SidebarMenuButton>
      //   </SidebarMenuItem>
      // </SidebarMenu>
      null
    );
  }

  const displayName = user.displayName || user.username || user.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer hover:bg-neutral-200 transition-colors duration-200"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal ">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer [&:hover]:bg-neutral-200">
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer [&:hover]:bg-neutral-200">
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer [&:hover]:bg-neutral-200"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
