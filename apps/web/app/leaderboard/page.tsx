"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { isContractConfigured } from "@/lib/genlayer/contract";

function winRateDisplay(wr: number): string {
  return (wr / 100).toFixed(1) + "%";
}

export default function LeaderboardPage() {
  const { data, isLoading, error } = useLeaderboard();

  if (!isContractConfigured()) {
    return (
      <>
        <PageHeader title="Leaderboard" />
        <div className="mx-auto max-w-3xl px-4 py-10 text-center text-text-muted">
          Contract not configured. Add NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS to .env.local
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Leaderboard"
        subtitle="Ranked by wins, then win rate, then captures. Data is live from the GenLayer contract."
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {isLoading && (
          <div className="py-12 text-center text-text-muted">Loading from GenLayer…</div>
        )}

        {error && (
          <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            Failed to load leaderboard: {String(error)}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="py-12 text-center text-text-muted">
            No games played yet. Be the first!
          </div>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-xs font-semibold uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-right">Played</th>
                  <th className="px-4 py-3 text-right">Wins</th>
                  <th className="px-4 py-3 text-right">Losses</th>
                  <th className="px-4 py-3 text-right">Captures</th>
                  <th className="px-4 py-3 text-right">Forfeits</th>
                  <th className="px-4 py-3 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={row.player}
                    className="border-b border-border/50 transition-colors hover:bg-surface-soft"
                  >
                    <td className="px-4 py-3 font-bold text-text-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-dark">
                      {row.player.slice(0, 10)}…{row.player.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-right text-text-dark">{row.gamesPlayed}</td>
                    <td className="px-4 py-3 text-right font-semibold text-success">{row.wins}</td>
                    <td className="px-4 py-3 text-right text-text-muted">{row.losses}</td>
                    <td className="px-4 py-3 text-right text-accent-gold">{row.captures}</td>
                    <td className="px-4 py-3 text-right text-danger">{row.forfeits}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      {winRateDisplay(row.winRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
