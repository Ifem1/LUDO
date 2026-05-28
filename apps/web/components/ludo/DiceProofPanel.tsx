"use client";

import type { GameState, PlayerColour } from "@ludoproof/shared";
import { useLocalSeed } from "@/hooks/useLocalSeed";

type Props = {
  game: GameState;
  myColour: PlayerColour | null;
};

export function DiceProofPanel({ game, myColour }: Props) {
  const { seedEntry, hasSeed } = useLocalSeed(game.gameId);
  const myPlayer = game.players.find((p) => p.colour === myColour);

  const diceLabel = game.currentDice
    ? `[${game.currentDice[0]}, ${game.currentDice[1]}]`
    : "—";

  return (
    <div className="rounded-xl border border-border bg-surface-soft p-4 text-xs">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent-green" />
        <span className="font-semibold text-text-dark">Two-Dice Proof Layer</span>
        <span className="ml-auto rounded bg-accent-green/20 px-2 py-0.5 font-bold text-success">
          Verified by GenLayer
        </span>
      </div>

      <p className="mb-2 text-text-muted">
        Both dice are derived from your cryptographically committed seed and verified by the
        contract on every roll. Same seed + same nonce always yields the same pair.
      </p>

      <div className="space-y-1.5 font-mono">
        <Row
          label="Formula d1"
          value="sha256(gameId|player|seed|rollNonce|moveCount|d0) % 6 + 1"
        />
        <Row
          label="Formula d2"
          value="sha256(gameId|player|seed|rollNonce|moveCount|d1) % 6 + 1"
        />
        <Row label="Current Dice" value={diceLabel} />
        <Row
          label="Dice Remaining"
          value={`[${(game.diceRemaining ?? []).join(", ")}]`}
        />
        <Row
          label="Consec. Doubles"
          value={String(game.consecutiveDoubles ?? 0)}
        />
        <Row label="Roll Nonce" value={String(game.currentRollNonce)} />
        <Row label="Move Count" value={String(game.moveCount)} />
        <Row
          label="My Commitment"
          value={myPlayer?.seedCommitment ? truncate(myPlayer.seedCommitment) : "—"}
        />
        <Row
          label="Local Seed"
          value={
            hasSeed()
              ? `${truncate(seedEntry?.rawSeed ?? "present", 20)} ✓`
              : "⚠ missing — cannot roll from this browser"
          }
          danger={!hasSeed()}
        />
        <Row label="Seed Committed" value={myPlayer?.hasCommittedSeed ? "Yes" : "No"} />
      </div>

      <div className="mt-3 rounded bg-surface-soft px-3 py-2 text-[10px] text-text-muted">
        ⚠ The dice you see while rolling are a placeholder animation. The authoritative pair
        comes from the contract once the transaction is confirmed.
      </div>
    </div>
  );
}

function truncate(s: string, max = 32): string {
  if (s.length <= max) return s;
  return s.slice(0, max / 2) + "…" + s.slice(-max / 2);
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-text-muted">{label}:</span>
      <span className={`break-all ${danger ? "text-danger" : "text-text-dark"}`}>{value}</span>
    </div>
  );
}
