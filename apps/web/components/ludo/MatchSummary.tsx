"use client";

import type { GameState } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";
import { GameStatusBadge } from "@/components/game/GameStatusBadge";

type Props = {
  game: GameState;
};

export function MatchSummary({ game }: Props) {
  const winner = game.players.find(
    (p) => p.address.toLowerCase() === game.winner?.toLowerCase()
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="font-bold text-text-dark">Match Summary</h3>
        <GameStatusBadge status={game.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Game ID" value={game.gameId} mono />
        <Stat label="Total Moves" value={String(game.moveCount)} />
        <Stat label="Players" value={String(game.players.length)} />
        {winner && (
          <Stat
            label="Winner"
            value={winner.colour.toUpperCase()}
            colour={COLOUR_HEX[winner.colour]}
          />
        )}
        <Stat label="Created" value={`Block ~${game.createdAt}`} />
        {game.completedAt && <Stat label="Completed" value={`Block ~${game.completedAt}`} />}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  colour,
}: {
  label: string;
  value: string;
  mono?: boolean;
  colour?: string;
}) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={`font-semibold text-text-dark ${mono ? "font-mono" : ""}`}
        style={colour ? { color: colour } : {}}
      >
        {value}
      </p>
    </div>
  );
}
