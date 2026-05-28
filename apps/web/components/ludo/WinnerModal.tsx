"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { GameState, PlayerColour } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";

type Props = {
  game: GameState;
  myColour: PlayerColour | null;
  onClose: () => void;
};

export function WinnerModal({ game, myColour, onClose }: Props) {
  const router = useRouter();
  const winner = game.players.find(
    (p) => p.address.toLowerCase() === game.winner?.toLowerCase()
  );
  const isMe = winner?.colour === myColour;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="mx-4 w-full max-w-sm rounded-2xl bg-surface p-8 text-center shadow-2xl"
        >
          <div className="mb-4 text-6xl">{isMe ? "🏆" : "🎮"}</div>
          <h2 className="mb-2 text-2xl font-black text-text-dark">
            {isMe ? "You Won!" : `${winner?.colour ?? "Unknown"} Wins!`}
          </h2>

          {winner && (
            <div
              className="mx-auto mb-4 h-2 w-16 rounded-full"
              style={{ backgroundColor: COLOUR_HEX[winner.colour] }}
            />
          )}

          <p className="mb-1 text-sm text-text-muted">
            Winner:{" "}
            <span className="font-mono text-text-dark">
              {game.winner?.slice(0, 8)}…
            </span>
          </p>
          <p className="mb-6 text-sm text-text-muted">
            Moves played: <span className="font-semibold">{game.moveCount}</span>
          </p>

          <div className="space-y-2">
            <button
              onClick={() => router.push(`/history/${game.gameId}`)}
              className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white hover:opacity-90"
            >
              View Match Replay
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-text-muted hover:bg-surface-soft"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
