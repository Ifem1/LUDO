"use client";

import { useGameStore } from "@/store/game-store";

export function useGameState() {
  return useGameStore((s) => s.game);
}
