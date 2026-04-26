"use client";

import { useCallback, useEffect, useState } from "react";
import { Gift, Grid3x3, Smile, Sparkles, Users } from "lucide-react";
import { appCache, CACHE_TTL, onHistoryRefresh } from "@/lib/cache";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/hooks/use-sidebar";
import { gamesService } from "@/services/games";
import type { GameResultResponse } from "@/types/games";
import { NavLink } from "react-router-dom";

export function NavProjects() {
  const { user, isLoading } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const cached = user ? appCache.get<GameResultResponse[]>("game-history", CACHE_TTL.PERSONAL) : null;
  const [history, setHistory] = useState<GameResultResponse[]>(cached ?? []);
  const [isLoadingGames, setIsLoadingGames] = useState(!cached && !!user);
  const [gamesError, setGamesError] = useState("");

  const loadHistory = useCallback(
    async (forceNetwork = false) => {
      if (!user) {
        setHistory([]);
        setGamesError("");
        setIsLoadingGames(false);
        return;
      }

      const cachedHistory = appCache.get<GameResultResponse[]>("game-history", CACHE_TTL.PERSONAL);

      if (!forceNetwork && cachedHistory) {
        setHistory(cachedHistory);
        setGamesError("");
        setIsLoadingGames(false);
        return;
      }

      setIsLoadingGames(!cachedHistory);
      try {
        setGamesError("");
        const response = await gamesService.getGameHistory();
        appCache.set("game-history", response.results);
        setHistory(response.results);
      } catch (error) {
        const parsed = gamesService.mapError(error);
        setGamesError(parsed.message);
      } finally {
        setIsLoadingGames(false);
      }
    },
    [user],
  );

  useEffect(() => {
    loadHistory(false);
  }, [loadHistory, user?.userId]);

  useEffect(() => {
    return onHistoryRefresh(() => {
      if (!user) return;
      void loadHistory(true);
    });
  }, [loadHistory, user]);

  if (!user) {
    return null;
  }

  const quickLinks = [
    {
      label: "Choose Me",
      href: "/create/choose-me",
      icon: Users,
      aiPowered: true,
    },
    {
      label: "Guess by Emoji",
      href: "/create/guess-by-emoji",
      icon: Smile,
      aiPowered: true,
    },
    {
      label: "Crossword",
      href: "/create/crossword",
      icon: Grid3x3,
      aiPowered: true,
    },
    {
      label: "Gift Website",
      href: "/gift-generator",
      icon: Gift,
      aiPowered: true,
    },
  ];

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="flex items-center gap-1.5">
          Create
        </SidebarGroupLabel>
        <SidebarMenu>
          {quickLinks.map(({ label, href, icon: Icon, aiPowered }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild className="hover:bg-neutral-200">
                <NavLink
                  to={href}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {aiPowered && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium bg-blue-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>History</SidebarGroupLabel>
        <SidebarMenu>
          {isLoadingGames || isLoading ? (
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
          ) : history.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <span>No games played yet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            history.map((result) => (
              <SidebarMenuItem
                key={result.gameResultId}
                className="hover:bg-neutral-200 rounded-lg cursor-pointer"
              >
                <SidebarMenuButton asChild className="hover:bg-neutral-200">
                  <NavLink
                    to={`/games/${result.gameId}`}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <span className="truncate">
                      {result.gameTitle ?? "Deleted game"}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                      {(result.score !== undefined && result.maxScore !== undefined) ? `${result.score}/${result.maxScore}` : ""}
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
