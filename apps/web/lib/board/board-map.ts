/**
 * Legacy facade — superseded by lib/ludo/path.ts. Kept so any older imports
 * continue working. Returns the simpler BoardCell shape the old code expected.
 */

import type { BoardCell, CellType } from "@/types/board";
import { getCellMap as getNewCellMap } from "@/lib/ludo/path";
import type { PlayerColour } from "@ludoproof/shared";

let _legacy: Map<string, BoardCell> | null = null;

function legacyType(kind: string, owner?: PlayerColour): CellType {
  if (kind === "perim-star") return "safe";
  if (kind === "perim-start") return "safe";
  if (kind === "perim" || kind === "home-entry") return "path";
  if (kind === "centre") return "centre";
  if (kind === "home-lane" || kind === "home-final") return `home-${owner}` as CellType;
  if (kind === "base" || kind === "base-rim") return `base-${owner}` as CellType;
  return "empty";
}

export function getBoardMap(): Map<string, BoardCell> {
  if (_legacy) return _legacy;
  const out = new Map<string, BoardCell>();
  for (const [key, meta] of getNewCellMap()) {
    out.set(key, {
      col: meta.col,
      row: meta.row,
      type: legacyType(meta.kind, meta.owner),
      pathIndex: meta.globalPos,
      homeLaneColour: meta.owner as PlayerColour | undefined,
      homeLaneIndex: meta.homeLocalPos != null ? meta.homeLocalPos - 52 : undefined,
      baseColour: meta.kind === "base" ? meta.owner : undefined,
      baseSlot: meta.baseSlot,
    });
  }
  _legacy = out;
  return out;
}

export function getCellAt(col: number, row: number): BoardCell | undefined {
  return getBoardMap().get(`${col},${row}`);
}
