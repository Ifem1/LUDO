"use client";

import { useQuery } from "@tanstack/react-query";
import { glGetLeaderboard } from "@/lib/genlayer/calls";
import { LEADERBOARD_LIMIT } from "@/lib/constants";
import type { PlayerStats } from "@ludoproof/shared";

function sortLeaderboard(rows: PlayerStats[]): PlayerStats[] {
  return [...rows].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.captures !== a.captures) return b.captures - a.captures;
    return b.gamesPlayed - a.gamesPlayed;
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const rows = await glGetLeaderboard(LEADERBOARD_LIMIT);
      return sortLeaderboard(rows);
    },
    staleTime: 30_000,
  });
}
