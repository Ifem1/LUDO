import { SAFE_SQUARES } from "./board-constants";

export function isSafeSquare(globalPosition: number): boolean {
  return SAFE_SQUARES.includes(globalPosition);
}

export function localToGlobal(colour: string, localPosition: number): number {
  if (localPosition < 0 || localPosition > 51) return -1;
  const offsets: Record<string, number> = { red: 0, blue: 13, yellow: 26, green: 39 };
  const offset = offsets[colour] ?? 0;
  return (offset + localPosition) % 52;
}
