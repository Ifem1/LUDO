"use client";

import { useQuery } from "@tanstack/react-query";
import { glGetRecentGames, glGetGame } from "@/lib/genlayer/calls";
import { RECENT_GAMES_LIMIT } from "@/lib/constants";

export function useRecentGames() {
  return useQuery({
    queryKey: ["recent-games"],
    queryFn: () => glGetRecentGames(RECENT_GAMES_LIMIT),
    staleTime: 30_000,
  });
}

export function useGameDetail(gameId: string | null) {
  return useQuery({
    queryKey: ["game-detail", gameId],
    queryFn: async () => {
      if (!gameId) return null;
      return glGetGame(gameId);
    },
    enabled: Boolean(gameId),
    staleTime: 60_000,
  });
}
