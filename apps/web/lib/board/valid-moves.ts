/**
 * Legacy facade — superseded by lib/ludo/rules.ts.
 */
import type { PlayerState } from "@ludoproof/shared";
import { validTokenIndexesForDie } from "@/lib/ludo/rules";

export function computeValidMoves(player: PlayerState, dice: number): number[] {
  return validTokenIndexesForDie(player, dice);
}
