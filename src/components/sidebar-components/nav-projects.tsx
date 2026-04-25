"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  Forward,
  Gift,
  Grid3x3,
  MoreHorizontal,
  Smile,
  Trash2,
  User2Icon,
  Users,
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { gamesService } from "@/services/games";
import type { GameResponse } from "@/types/games";
import { NavLink, useNavigate } from "react-router-dom";
import { useSidebar } from "@/hooks/use-sidebar";

export function NavProjects() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameResponse[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setGames([]);
      setGamesError("");
      setIsLoadingGames(false);
      return;
    }

    const loadGames = async () => {
      setIsLoadingGames(true);

      try {
        setGamesError("");
        const response = await gamesService.listGames();
        if (isMounted) {
          setGames(response.games);
        }
      } catch (error) {
        const parsed = gamesService.mapError(error);
        if (isMounted) {
          setGamesError(parsed.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingGames(false);
        }
      }
    };

    loadGames();

    return () => {
      isMounted = false;
    };
  }, [user]);

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

  const quickLinks = [
    { label: "Choose Me", href: "/create/choose-me", icon: Users },
    { label: "Guess by Emoji", href: "/create/guess-by-emoji", icon: Smile },
    { label: "Crossword", href: "/create/crossword", icon: Grid3x3 },
    { label: "Gift Website", href: "/gift-generator", icon: Gift },
  ];

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Create</SidebarGroupLabel>
        <SidebarMenu>
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild className="hover:bg-neutral-200">
                <NavLink to={href}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {isLoadingGames ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span>Loading games...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : gamesError ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span>Unable to load games</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : games.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span>No games yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          games.map((game) => (
          <SidebarMenuItem
            key={game.gameId}
            className="hover:bg-neutral-200 rounded-lg cursor-pointer"
          >
            <SidebarMenuButton asChild className="hover:bg-neutral-200">
              <NavLink to={`/games/${game.gameId}`}>
                <span className="truncate">{game.title}</span>
              </NavLink>
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
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
    </>
  );
}
