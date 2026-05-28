"use client";

import { use } from "react";
import { useGameDetail } from "@/hooks/useGameHistory";
import { PageHeader } from "@/components/layout/PageHeader";
import { MoveHistory } from "@/components/ludo/MoveHistory";
import { MatchSummary } from "@/components/ludo/MatchSummary";
import { GameStatusBadge } from "@/components/game/GameStatusBadge";
import { PlayerCard } from "@/components/ludo/PlayerCard";

export default function GameHistoryPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const { data: game, isLoading } = useGameDetail(gameId);

  return (
    <>
      <PageHeader
        title={`Game ${gameId}`}
        subtitle="Full match history from the GenLayer contract."
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {isLoading && (
          <div className="py-12 text-center text-text-muted">Loading from GenLayer…</div>
        )}

        {!isLoading && !game && (
          <div className="py-12 text-center text-danger">Game not found.</div>
        )}

        {game && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <GameStatusBadge status={game.status} />
              <span className="text-sm text-text-muted">{game.moveCount} total moves</span>
            </div>

            <MatchSummary game={game} />

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                Players
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {game.players.map((p) => (
                  <PlayerCard
                    key={p.address}
                    player={p}
                    isCurrentTurn={false}
                    isMe={false}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                Move Log ({game.moveHistory.length} events)
              </p>
              <div className="rounded-xl border border-border bg-surface p-4">
                <MoveHistory moves={game.moveHistory} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
