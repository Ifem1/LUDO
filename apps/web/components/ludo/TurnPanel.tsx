"use client";

import type { GameState, PlayerColour } from "@ludoproof/shared";
import { COLOUR_HEX } from "@/lib/constants";

type Props = {
  game: GameState;
  myColour: PlayerColour | null;
};

export function TurnPanel({ game, myColour }: Props) {
  if (game.status !== "active") return null;
  const current = game.players[game.currentTurnIndex];
  if (!current) return null;

  const isYou = current.colour === myColour;

  const diceLabel = game.currentDice
    ? `${game.currentDice[0]} + ${game.currentDice[1]}`
    : null;
  const remainingLabel =
    game.diceRemaining.length > 0 ? game.diceRemaining.join(", ") : null;

  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ borderColor: COLOUR_HEX[current.colour] + "66" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: COLOUR_HEX[current.colour] }}
        />
        <div>
          <p className="text-sm font-semibold text-text-dark">
            {isYou
              ? "Your turn"
              : `${current.colour.charAt(0).toUpperCase() + current.colour.slice(1)}'s turn`}
          </p>
          <p className="font-mono text-xs text-text-muted">
            {current.address.slice(0, 6)}…{current.address.slice(-4)}
          </p>
        </div>
        {game.consecutiveDoubles > 0 && (
          <span className="ml-auto rounded bg-accent-gold/20 px-2 py-0.5 text-xs font-bold text-accent-gold">
            {game.consecutiveDoubles}× doubles
          </span>
        )}
      </div>

      {diceLabel && (
        <p className="mt-2 text-sm text-text-muted">
          Rolled: <span className="font-bold text-text-dark">{diceLabel}</span>
          {remainingLabel && (
            <span className="ml-2 text-xs">
              (remaining: <span className="font-bold text-primary">{remainingLabel}</span>)
            </span>
          )}
          {game.mustMove && " — pick a die, then a token"}
        </p>
      )}
    </div>
  );
}
