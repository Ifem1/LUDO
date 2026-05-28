"use client";

import { useMemo } from "react";
import { useGameState } from "./useGameState";
import { useWallet } from "./useWallet";
import { validMovesByDie } from "@/lib/ludo/rules";

/**
 * Returns a map from die value → array of legal token indexes for that die,
 * limited to the current player's turn (and only when there are pending dice
 * to spend). Driven by the pure rule engine in lib/ludo/rules.
 */
export function useValidMoves(): Record<number, number[]> {
  const game = useGameState();
  const { address } = useWallet();

  return useMemo(() => {
    if (!game || game.status !== "active" || !game.mustMove) return {};
    if (!game.diceRemaining || game.diceRemaining.length === 0) return {};

    const currentPlayer = game.players[game.currentTurnIndex];
    if (!currentPlayer) return {};
    if (currentPlayer.address.toLowerCase() !== (address ?? "")) return {};

    return validMovesByDie(currentPlayer, game.diceRemaining);
  }, [game, address]);
}
