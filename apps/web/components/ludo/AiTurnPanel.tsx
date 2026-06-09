"use client";

import { useState } from "react";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import type { GameState } from "@ludoproof/shared";

export function AiTurnPanel({ game }: { game: GameState }) {
  const { aiTakeTurn } = useGenLayerContract(game.gameId);
  const [busy, setBusy] = useState(false);

  if (game.mode !== "vs_ai" || game.status !== "active") return null;

  const current = game.players[game.currentTurnIndex];
  if (!current?.isAi) return null;

  async function handleClick() {
    setBusy(true);
    try {
      await aiTakeTurn();
    } catch {
      // toast shown by hook
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
        AI Opponent&apos;s Turn
      </p>
      <p className="mb-3 text-sm text-text-muted">
        Click to have the AI roll and play. Dice come from the validator-consensus drand beacon;
        the token choice is decided by an LLM under the comparative equivalence principle.
      </p>
      <button
        onClick={handleClick}
        disabled={busy}
        className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "AI thinking…" : "Let AI play"}
      </button>
    </div>
  );
}
