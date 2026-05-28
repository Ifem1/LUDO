/**
 * Pure Ludo rule helpers. The contract is the final authority — these
 * functions exist to drive the UI (highlight legal tokens, decide which
 * die to auto-select, preview captures, etc.) and to keep all game logic
 * in one place outside React.
 */

import type { GameState, PlayerState, PlayerColour } from "@ludoproof/shared";
import {
  BASE_POSITION,
  FINISH_POSITION,
  HOME_LANE_START_LOCAL,
  HOME_LANE_END_LOCAL,
  PERIMETER_LENGTH,
  localToGlobal,
  isSafeGlobal,
  COLOUR_START_GLOBAL_POS,
} from "./path";

/** Base-exit rule mode. The contract currently enforces `six` (a single 6). */
export type BaseExitMode = "six" | "sum-six";

export const DEFAULT_BASE_EXIT_MODE: BaseExitMode = "six";

/** Returns the new local position after spending `die` on a token at `position`, or null if illegal. */
export function projectedPosition(
  position: number,
  die: number,
  mode: BaseExitMode = DEFAULT_BASE_EXIT_MODE
): number | null {
  if (position === BASE_POSITION) {
    // The currently-deployed contract requires a single 6 to leave base.
    // `sum-six` mode would let the *caller* choose to spend a die value
    // that's part of a 1+5 / 2+4 pair, but that logic lives one layer up.
    if (mode === "six" && die === 6) return 0;
    if (mode === "sum-six" && (die === 6 || die === 0)) return die === 6 ? 0 : 0;
    return null;
  }
  const next = position + die;
  if (next > FINISH_POSITION) return null;
  return next;
}

/** Indexes of tokens that could legally use the given die value. */
export function validTokenIndexesForDie(player: PlayerState, die: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (projectedPosition(player.tokens[i], die) !== null) {
      out.push(i);
    }
  }
  return out;
}

/** Map of die value → legal token indexes for the current dice in hand. */
export function validMovesByDie(
  player: PlayerState,
  diceRemaining: number[]
): Record<number, number[]> {
  const out: Record<number, number[]> = {};
  const seen = new Set<number>();
  for (const d of diceRemaining) {
    if (seen.has(d)) continue;
    seen.add(d);
    out[d] = validTokenIndexesForDie(player, d);
  }
  return out;
}

/** True if at least one of the unspent dice can move at least one token. */
export function anyPlayableMove(player: PlayerState, diceRemaining: number[]): boolean {
  for (const d of diceRemaining) {
    if (validTokenIndexesForDie(player, d).length > 0) return true;
  }
  return false;
}

/**
 * Predict whether playing `die` on the given token will capture any opponents.
 * Used for the move-preview UI. The contract is the final word on captures.
 */
export function previewCaptures(
  game: GameState,
  tokenIndex: number,
  die: number
): Array<{ playerAddress: string; capturedTokenIndex: number; colour: PlayerColour }> {
  const player = game.players[game.currentTurnIndex];
  if (!player) return [];

  const newPos = projectedPosition(player.tokens[tokenIndex], die);
  if (newPos === null || newPos < 0 || newPos >= PERIMETER_LENGTH) return [];

  const landingGlobal = localToGlobal(player.colour, newPos);
  if (landingGlobal < 0 || isSafeGlobal(landingGlobal)) return [];

  // Count own tokens on this cell — opponents can't be captured on a blockade
  // of our own ≥2 tokens (we'd be joining a stack, not landing alone).
  const captures: Array<{ playerAddress: string; capturedTokenIndex: number; colour: PlayerColour }> = [];

  for (let pi = 0; pi < game.players.length; pi++) {
    if (pi === game.currentTurnIndex) continue;
    const opp = game.players[pi];
    if (opp.forfeited) continue;
    for (let ti = 0; ti < 4; ti++) {
      const oppPos = opp.tokens[ti];
      if (oppPos < 0 || oppPos >= PERIMETER_LENGTH) continue;
      const oppGlobal = localToGlobal(opp.colour, oppPos);
      if (oppGlobal === landingGlobal) {
        captures.push({
          playerAddress: opp.address,
          capturedTokenIndex: ti,
          colour: opp.colour,
        });
      }
    }
  }

  return captures;
}

/** True if a colour's tokens on the same global cell form an opponent-blocking stack. */
export function isBlockade(game: GameState, globalPos: number, byColour: PlayerColour): boolean {
  let count = 0;
  for (const p of game.players) {
    if (p.colour !== byColour) continue;
    for (const t of p.tokens) {
      if (t < 0 || t >= PERIMETER_LENGTH) continue;
      if (localToGlobal(p.colour, t) === globalPos) count++;
    }
  }
  return count >= 2;
}

/** Returns all global cells that hold any token, for stacking/render maths. */
export function tokensOnGlobalCells(game: GameState): Map<number, Array<{ colour: PlayerColour; playerIdx: number; tokenIdx: number }>> {
  const m = new Map<number, Array<{ colour: PlayerColour; playerIdx: number; tokenIdx: number }>>();
  game.players.forEach((p, pi) => {
    p.tokens.forEach((pos, ti) => {
      if (pos < 0 || pos >= PERIMETER_LENGTH) return;
      const g = localToGlobal(p.colour, pos);
      const arr = m.get(g) ?? [];
      arr.push({ colour: p.colour, playerIdx: pi, tokenIdx: ti });
      m.set(g, arr);
    });
  });
  return m;
}

/** Convenience: which colour, if any, "owns" the home-column at this local position. */
export function homeLaneOwnerOf(position: number, colour: PlayerColour): PlayerColour | null {
  if (position >= HOME_LANE_START_LOCAL && position <= HOME_LANE_END_LOCAL) return colour;
  if (position === FINISH_POSITION) return colour;
  return null;
}

/** True if a player has finished all four tokens. */
export function isWinner(player: PlayerState): boolean {
  return player.tokens.every((t) => t === FINISH_POSITION);
}

export {
  BASE_POSITION,
  FINISH_POSITION,
  HOME_LANE_START_LOCAL,
  HOME_LANE_END_LOCAL,
  PERIMETER_LENGTH,
  COLOUR_START_GLOBAL_POS,
};
