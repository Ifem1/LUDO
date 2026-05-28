"use client";

import type { PlayerState, PlayerColour } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";

type Props = {
  player: PlayerState;
  isCurrentTurn: boolean;
  isMe: boolean;
};

function tokenIcon(pos: number) {
  if (pos === -1) return "⬛";
  if (pos === 58) return "🏠";
  if (pos >= 52) return "🔜";
  return "▶";
}

export function PlayerCard({ player, isCurrentTurn, isMe }: Props) {
  const hex = COLOUR_HEX[player.colour];
  const finished = player.tokens.filter((t) => t === 58).length;
  const inBase = player.tokens.filter((t) => t === -1).length;

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        player.forfeited ? "opacity-40" : ""
      } ${isCurrentTurn ? "ring-2" : ""}`}
      style={{
        borderColor: hex + "88",
        ringColor: hex,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: hex }} />
        <span className="text-sm font-semibold capitalize text-text-dark">
          {player.colour} {isMe && <span className="text-xs text-text-muted">(you)</span>}
        </span>
        {player.forfeited && (
          <span className="ml-auto text-xs text-danger">Forfeited</span>
        )}
        {!player.hasCommittedSeed && !player.forfeited && (
          <span className="ml-auto text-xs text-tx-pending">Seed pending</span>
        )}
      </div>

      <div className="flex gap-1">
        {player.tokens.map((pos, i) => (
          <span key={i} title={`Token ${i}: pos ${pos}`} className="text-base">
            {tokenIcon(pos)}
          </span>
        ))}
      </div>

      <div className="mt-1 flex gap-3 text-xs text-text-muted">
        <span>{finished} done</span>
        <span>{inBase} in base</span>
      </div>

      <p className="mt-1 font-mono text-[10px] text-text-muted">
        {player.address.slice(0, 8)}…
      </p>
    </div>
  );
}
