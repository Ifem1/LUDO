/**
 * Legacy facade — superseded by lib/ludo/path.ts (`tokenLocalToCell`).
 * Old code used token positions as GLOBAL indexes into PATH_COORDINATES,
 * which was wrong: positions are LOCAL to the colour. The new helper
 * applies the colour offset correctly.
 */

import type { PlayerColour } from "@ludoproof/shared";
import type { TokenRenderPosition } from "@/types/board";
import { tokenLocalToCell, BASE_POSITION } from "@/lib/ludo/path";

export function getTokenRenderPosition(
  colour: PlayerColour,
  tokenPosition: number,
  tokenSlotInBase = 0
): TokenRenderPosition {
  const [col, row] = tokenLocalToCell(colour, tokenPosition, tokenSlotInBase);
  return {
    col,
    row,
    inBase: tokenPosition === BASE_POSITION,
    baseSlot: tokenPosition === BASE_POSITION ? tokenSlotInBase : undefined,
  };
}
