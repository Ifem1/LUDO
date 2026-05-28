"use client";

import { useState, useCallback } from "react";
import { useGenLayerContract } from "./useGenLayerContract";
import { useLocalSeed } from "./useLocalSeed";
import { useUiStore } from "@/store/ui-store";

export function useDice(gameId: string) {
  const [rolling, setRolling] = useState(false);
  const { rollDice } = useGenLayerContract(gameId);
  const { getStoredSeed } = useLocalSeed(gameId);
  const setDiceAnimating = useUiStore((s) => s.setDiceAnimating);

  const roll = useCallback(async () => {
    const seed = getStoredSeed();
    if (!seed) throw new Error("missing_local_seed");
    setRolling(true);
    setDiceAnimating(true);
    try {
      const hash = await rollDice(seed);
      return hash;
    } finally {
      setRolling(false);
      setTimeout(() => setDiceAnimating(false), 1500);
    }
  }, [getStoredSeed, rollDice, setDiceAnimating]);

  return { roll, rolling };
}
