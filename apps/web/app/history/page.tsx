"use client";

import { useRecentGames } from "@/hooks/useGameHistory";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { isContractConfigured } from "@/lib/genlayer/contract";

type GameRow = {
  game_id: string;
  players: string[];
  winner: string | null;
  status: string;
  move_count: number;
  created_at: number;
  completed_at: number | null;
};

export default function HistoryPage() {
  const { data, isLoading, error } = useRecentGames();

  if (!isContractConfigured()) {
    return (
      <>
        <PageHeader title="Game History" />
        <div className="mx-auto max-w-3xl px-4 py-10 text-center text-text-muted">
          Contract not configured.
        </div>
      </>
    );
  }

  const games = (data ?? []) as GameRow[];

  return (
    <>
      <PageHeader
        title="Game History"
        subtitle="Recent games from the GenLayer contract."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-3">
        {isLoading && (
          <div className="py-12 text-center text-text-muted">Loading…</div>
        )}
        {error && (
          <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            Error: {String(error)}
          </div>
        )}
        {!isLoading && games.length === 0 && (
          <div className="py-12 text-center text-text-muted">No games yet.</div>
        )}
        {games.map((g) => (
          <Link key={g.game_id} href={`/history/${g.game_id}`}>
            <div className="rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-primary/50 hover:bg-surface-soft cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-text-dark">{g.game_id}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    g.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : g.status === "active"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {g.status}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-xs text-text-muted">
                <span>{g.players.length} players</span>
                <span>{g.move_count} moves</span>
                {g.winner && (
                  <span>
                    Winner:{" "}
                    <span className="font-mono">{g.winner.slice(0, 8)}…</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
