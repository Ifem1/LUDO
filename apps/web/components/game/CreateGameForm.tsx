"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import { useLocalSeed } from "@/hooks/useLocalSeed";
import { PLAYER_COLOURS, COLOUR_HEX } from "@/lib/constants";
import { GenLayerTxStatus } from "./GenLayerTxStatus";
import { GameInviteCard } from "./GameInviteCard";
import type { PlayerColour } from "@ludoproof/shared";

function generateGameId(): string {
  return crypto.randomUUID().split("-")[0].toUpperCase();
}

export function CreateGameForm() {
  const router = useRouter();
  const { address } = useWallet();
  const [gameId] = useState(() => generateGameId());
  const [mode, setMode] = useState<"pvp" | "vs_ai">("pvp");
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(2);
  const [colour, setColour] = useState<PlayerColour>("red");
  const [step, setStep] = useState<"form" | "creating" | "joining" | "seeding" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  const { createGame, joinGame, commitSeed } = useGenLayerContract(gameId);
  const { prepareSeed, confirmCommitted } = useLocalSeed(gameId);

  async function handleCreate() {
    if (!address) return;
    setError(null);
    try {
      setStep("creating");
      // vs_ai forces 2 players (1 human + the AI seat); the contract enforces
      // the same, but we send the right value to avoid an extra failure mode.
      await createGame(mode === "vs_ai" ? 2 : maxPlayers, mode);

      setStep("joining");
      // In vs_ai the AI takes "blue" — refuse it client-side so the contract
      // never returns colour_taken.
      const joinColour = mode === "vs_ai" && colour === "blue" ? "red" : colour;
      await joinGame(joinColour);

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

  const stepLabels = {
    form: null,
    creating: "Creating game on GenLayer…",
    joining: "Joining as " + colour + "…",
    seeding: "Committing seed…",
    done: null,
  };

  if (step === "done") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-accent-green/10 border border-accent-green px-5 py-4">
          <p className="font-semibold text-success">Game created!</p>
          <p className="mt-1 text-sm text-text-muted">
            Game ID: <span className="font-mono font-bold text-text-dark">{gameId}</span>
          </p>
        </div>
        <GameInviteCard gameId={gameId} />
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
        <p className="rounded-lg border border-border bg-surface-soft px-3 py-2 font-mono text-sm">
          {gameId}
        </p>
        <p className="mt-1 text-xs text-text-muted">Auto-generated. Share this with friends to join.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-text-dark">Mode</label>
        <div className="flex gap-2">
          {([
            { key: "pvp", label: "PvP", desc: "Play vs friends" },
            { key: "vs_ai", label: "vs AI", desc: "LLM opponent" },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${
                mode === m.key
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-muted hover:border-primary"
              }`}
            >
              <div>{m.label}</div>
              <div className="text-[10px] font-normal opacity-80">{m.desc}</div>
            </button>
          ))}
        </div>
        {mode === "vs_ai" && (
          <p className="mt-1 text-xs text-text-muted">
            The AI takes the <strong>blue</strong> seat. Its moves are decided by an LLM under
            GenLayer&apos;s comparative equivalence principle.
          </p>
        )}
      </div>

      {mode === "pvp" && (
      <div>
        <label className="mb-2 block text-sm font-semibold text-text-dark">Max Players</label>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => setMaxPlayers(n)}
              className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${
                maxPlayers === n
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-muted hover:border-primary"
              }`}
            >
              {n} Players
            </button>
          ))}
        </div>
      </div>
      )}

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

      {stepLabels[step] && (
        <div className="rounded-lg bg-surface-soft px-4 py-3 text-sm text-primary animate-pulse">
          {stepLabels[step]}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <button
        onClick={handleCreate}
        disabled={step !== "form"}
        className="w-full rounded-xl bg-primary py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {step === "form" ? "Create & Join Game" : "Processing…"}
      </button>

      <div className="rounded-lg bg-surface-soft px-4 py-3 text-xs text-text-muted">
        <strong>What happens:</strong> A game is created on the GenLayer contract, you join as{" "}
        {colour}, and a cryptographic seed is generated and committed on-chain. The raw seed
        is stored in your browser for dice rolling.
      </div>
    </div>
  );
}
