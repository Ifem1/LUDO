import { create } from "zustand";
import type { GameState } from "@ludoproof/shared";

type GameStore = {
  game: GameState | null;
  isPolling: boolean;
  lastFetchedAt: number | null;
  setGame: (game: GameState | null) => void;
  setPolling: (polling: boolean) => void;
  clearGame: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  isPolling: false,
  lastFetchedAt: null,
  setGame: (game) => set({ game, lastFetchedAt: Date.now() }),
  setPolling: (isPolling) => set({ isPolling }),
  clearGame: () => set({ game: null, isPolling: false, lastFetchedAt: null }),
}));
