"use client";

import { useEffect, useState } from "react";
import { useDice } from "@/hooks/useDice";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import { useUiStore } from "@/store/ui-store";
import { useLocalSeed } from "@/hooks/useLocalSeed";
import { Dice } from "./Dice";
import type { GameState, PlayerColour } from "@ludoproof/shared";

type Props = {
  game: GameState;
  myColour: PlayerColour | null;
  validMoves: Record<number, number[]>;
  selectedDie: number | null;
  setSelectedDie: (val: number | null) => void;
};

export function GameControls({
  game,
  myColour,
  validMoves,
  selectedDie,
  setSelectedDie,
}: Props) {
  const { roll, rolling } = useDice(game.gameId);
  const { startGame } = useGenLayerContract(game.gameId);
  const { setForfeitModal } = useUiStore();
  const { hasSeed } = useLocalSeed(game.gameId);
  const diceAnimating = useUiStore((s) => s.diceAnimating);

  const currentPlayer = game.players[game.currentTurnIndex];
  const isMyTurn = currentPlayer?.colour === myColour && game.status === "active";
  const myPlayer = game.players.find((p) => p.colour === myColour);
  const allSeeded = game.players.every((p) => p.hasCommittedSeed);
  const amCreator = game.creator.toLowerCase() === myPlayer?.address.toLowerCase();

  // Auto-select the remaining die when only one playable die is left.
  useEffect(() => {
    if (!isMyTurn || !game.mustMove) {
      if (selectedDie !== null) setSelectedDie(null);
      return;
    }

    const playableDice = Object.entries(validMoves)
      .filter(([, tokens]) => tokens.length > 0)
      .map(([die]) => Number(die));

    if (playableDice.length === 1 && selectedDie !== playableDice[0]) {
      setSelectedDie(playableDice[0]);
    } else if (playableDice.length === 0 && selectedDie !== null) {
      setSelectedDie(null);
    } else if (selectedDie !== null && !playableDice.includes(selectedDie)) {
      // Currently-selected die isn't playable anymore — clear selection.
      setSelectedDie(playableDice[0] ?? null);
    }
  }, [isMyTurn, game.mustMove, validMoves, selectedDie, setSelectedDie]);

  if (game.status === "waiting" || game.status === "seed_commit") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-surface-soft px-4 py-3 text-sm text-text-muted">
          Waiting for{" "}
          {game.status === "waiting"
            ? `players (${game.players.length}/${game.maxPlayers})`
            : "all players to commit seeds"}
        </div>

        {amCreator && allSeeded && game.players.length >= 2 && (
          <button
            onClick={() => startGame()}
            className="w-full rounded-xl bg-accent-green py-3 font-bold text-white hover:opacity-90"
          >
            Start Game
          </button>
        )}

        <button
          onClick={() => setForfeitModal(true)}
          className="w-full rounded-xl border border-danger py-2 text-sm font-semibold text-danger hover:bg-danger/5"
        >
          Cancel / Forfeit
        </button>
      </div>
    );
  }

  if (game.status === "active") {
    const canRoll = isMyTurn && !game.diceRemaining.length && !game.mustMove;
    const seedMissing = !hasSeed();
    const isDoubles =
      game.currentDice && game.currentDice[0] === game.currentDice[1];

    return (
      <div className="space-y-4">
        <Dice
          values={game.currentDice}
          remaining={game.diceRemaining}
          rolling={diceAnimating}
          selectedDie={selectedDie}
          onSelect={isMyTurn ? setSelectedDie : undefined}
        />

        {isDoubles && game.diceRemaining.length > 0 && (
          <div className="rounded-lg bg-accent-gold/10 px-3 py-2 text-center text-xs font-bold text-accent-gold">
            🎲🎲 Doubles! Bonus turn after both dice are played.
          </div>
        )}

        {canRoll && seedMissing && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
            Seed missing from this browser. You cannot roll here.
          </p>
        )}

        {canRoll && !seedMissing && (
          <button
            onClick={roll}
            disabled={rolling}
            className="w-full rounded-xl bg-primary py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {rolling ? "Rolling…" : "Roll Both Dice"}
          </button>
        )}

        {!isMyTurn && (
          <p className="text-center text-sm text-text-muted">
            Waiting for opponent…
          </p>
        )}

        {isMyTurn && game.mustMove && (
          <div className="rounded-lg bg-surface-soft px-3 py-2 text-center text-xs">
            {selectedDie === null ? (
              <span className="text-text-muted">Click a die above to choose its value, then click a highlighted token.</span>
            ) : (
              <span className="text-primary font-semibold">
                Die {selectedDie} selected — click a token to move it.
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => setForfeitModal(true)}
          className="w-full rounded-xl border border-danger py-2 text-xs font-semibold text-danger hover:bg-danger/5"
        >
          Forfeit
        </button>
      </div>
    );
  }

  return null;
}
