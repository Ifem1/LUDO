"use client";

import { motion } from "framer-motion";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import { useUiStore } from "@/store/ui-store";
import type { GameState } from "@ludoproof/shared";

type Props = {
  game: GameState;
};

export function ForfeitModal({ game }: Props) {
  const { forfeitGame, cancelGame } = useGenLayerContract(game.gameId);
  const { setForfeitModal } = useUiStore();

  const isPreGame = game.status === "waiting" || game.status === "seed_commit";

  async function handleAction() {
    if (isPreGame) await cancelGame();
    else await forfeitGame();
    setForfeitModal(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-4 w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl"
      >
        <h3 className="mb-2 text-lg font-bold text-text-dark">
          {isPreGame ? "Cancel Game?" : "Forfeit Game?"}
        </h3>
        <p className="mb-6 text-sm text-text-muted">
          {isPreGame
            ? "This will cancel the game before it starts. Cannot be undone."
            : "Your remaining tokens return to base. The other player wins if they are the last active player."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setForfeitModal(false)}
            className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold text-text-muted hover:bg-surface-soft"
          >
            Stay
          </button>
          <button
            onClick={handleAction}
            className="flex-1 rounded-xl bg-danger py-2 text-sm font-bold text-white hover:opacity-90"
          >
            {isPreGame ? "Cancel Game" : "Forfeit"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
