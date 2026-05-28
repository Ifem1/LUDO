"use client";

import { useQuery } from "@tanstack/react-query";
import { glGetGame } from "@/lib/genlayer/calls";
import { useGameStore } from "@/store/game-store";
import { useEffect } from "react";
import { POLL_INTERVAL_ACTIVE, POLL_INTERVAL_WAITING } from "@/lib/constants";
import type { GameStatus } from "@ludoproof/shared";

function pollInterval(status: GameStatus | undefined): number | false {
  if (!status) return POLL_INTERVAL_WAITING;
  if (status === "waiting" || status === "seed_commit") return POLL_INTERVAL_WAITING;
  if (status === "active") return POLL_INTERVAL_ACTIVE;
  return false;
}

export function useGamePolling(gameId: string | null) {
  const setGame = useGameStore((s) => s.setGame);
  const currentStatus = useGameStore((s) => s.game?.status);

  const interval = pollInterval(currentStatus);

  const query = useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const game = await glGetGame(gameId);
      return game;
    },
    enabled: Boolean(gameId),
    refetchInterval: interval,
    staleTime: 1000,
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setGame(query.data);
    }
  }, [query.data, setGame]);

  return query;
}
