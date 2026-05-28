import type { PlayerColour } from "./types";
import { COLOURS } from "./board-constants";
import { nextPosition } from "./movement";

export function isValidColour(colour: string): colour is PlayerColour {
  return (COLOURS as readonly string[]).includes(colour);
}

export function getValidTokenIndexes(
  tokens: [number, number, number, number],
  dice: number
): number[] {
  const valid: number[] = [];
  for (let i = 0; i < 4; i++) {
    const pos = tokens[i];
    const next = nextPosition(pos, dice);
    if (next !== null) valid.push(i);
  }
  return valid;
}
