"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import { useLocalSeed } from "@/hooks/useLocalSeed";
import { PLAYER_COLOURS, COLOUR_HEX } from "@/lib/constants";
import { GenLayerTxStatus } from "./GenLayerTxStatus";
import type { PlayerColour } from "@ludoproof/shared";

export function JoinGameForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { address } = useWallet();
  const [gameId, setGameId] = useState(params.get("gameId") ?? "");
  const [colour, setColour] = useState<PlayerColour>("blue");
  const [step, setStep] = useState<"form" | "joining" | "seeding" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  const { joinGame, commitSeed } = useGenLayerContract(gameId);
  const { prepareSeed, confirmCommitted } = useLocalSeed(gameId);

  async function handleJoin() {
    if (!address || !gameId.trim()) return;
    setError(null);
    try {
      setStep("joining");
      await joinGame(colour);

      setStep("seeding");
      const { commitment } = await prepareSeed();
      await commitSeed(commitment);
      confirmCommitted();

      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("form");
    }
  }

  if (step === "done") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-accent-green/10 border border-accent-green px-5 py-4">
          <p className="font-semibold text-success">Joined successfully!</p>
          <p className="mt-1 text-sm text-text-muted">
            Game ID: <span className="font-mono font-bold text-text-dark">{gameId}</span>
          </p>
        </div>
        <button
          onClick={() => router.push(`/game/${gameId}`)}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:opacity-90"
        >
          Go to Game Room
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GenLayerTxStatus />

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-dark">Game ID</label>
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value.trim().toUpperCase())}
          placeholder="e.g. A3F9B2C1"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-text-dark">Your Colour</label>
        <div className="flex gap-3">
          {PLAYER_COLOURS.map((c) => (
            <button
              key={c}
              onClick={() => setColour(c)}
              title={c}
              style={{ backgroundColor: COLOUR_HEX[c] }}
              className={`h-10 w-10 rounded-full border-4 transition-transform hover:scale-110 ${
                colour === c ? "border-text-dark scale-110" : "border-transparent"
              }`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs capitalize text-text-muted">Selected: {colour}</p>
      </div>

      {step !== "form" && (
        <div className="rounded-lg bg-surface-soft px-4 py-3 text-sm text-primary animate-pulse">
          {step === "joining" ? "Joining game on GenLayer…" : "Committing seed…"}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <button
        onClick={handleJoin}
        disabled={step !== "form" || !gameId.trim()}
        className="w-full rounded-xl bg-primary py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {step === "form" ? "Join Game" : "Processing…"}
      </button>
    </div>
  );
}
