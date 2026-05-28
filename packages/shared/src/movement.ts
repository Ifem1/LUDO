import { FINISH_POSITION, BASE_POSITION } from "./board-constants";

export function nextPosition(oldPosition: number, dice: number): number | null {
  if (oldPosition === BASE_POSITION) {
    if (dice === 6) return 0;
    return null;
  }
  const next = oldPosition + dice;
  if (next > FINISH_POSITION) return null;
  return next;
}

export function isFinished(position: number): boolean {
  return position === FINISH_POSITION;
}

export function isOnBoard(position: number): boolean {
  return position >= 0 && position <= 51;
}

export function isInHomeLane(position: number): boolean {
  return position >= 52 && position <= 57;
}

export function isInBase(position: number): boolean {
  return position === BASE_POSITION;
}
