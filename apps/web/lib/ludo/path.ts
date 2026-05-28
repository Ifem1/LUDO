/**
 * Canonical board path: a single source of truth for every cell the game
 * cares about. Built on top of the shared geometry constants.
 */

import type { PlayerColour } from "@ludoproof/shared";
import {
  PATH_COORDINATES,
  HOME_LANE_COORDINATES,
  BASE_CELL_COORDINATES,
  BASE_RECTS,
  CENTRE_CELL,
  CENTRE_CORNER_CELLS,
  COLOUR_START_GLOBAL_POS,
  COLOUR_HOME_ENTRY_POS,
  SAFE_SQUARES,
} from "@ludoproof/shared";

export const COLOURS: readonly PlayerColour[] = ["red", "blue", "yellow", "green"];

export const BOARD_SIZE = 15;
export const PERIMETER_LENGTH = 52;
export const HOME_LANE_LENGTH = 6;
export const BASE_POSITION = -1;
export const HOME_LANE_START_LOCAL = 52;
export const HOME_LANE_END_LOCAL = 57;
export const FINISH_POSITION = 58;

/** Star safe squares (non-start safe perimeter cells). */
export const STAR_SAFE_GLOBALS = SAFE_SQUARES.filter(
  (p) => !Object.values(COLOUR_START_GLOBAL_POS).includes(p)
);

export type CellKind =
  | "base"           // a base spawn pad
  | "base-rim"       // a non-pad cell inside the base rectangle (visual only)
  | "perim"          // ordinary outer perimeter cell
  | "perim-start"    // a colour's start cell (always safe)
  | "perim-star"     // an off-start safe star cell
  | "home-entry"     // perimeter cell that funnels a colour into its home column
  | "home-lane"      // inside a home column
  | "home-final"     // last home column cell (adjacent to centre)
  | "centre"         // victory cell
  | "centre-corner"  // decorative inside corner of the centre junction
  | "background";    // anything else (rendered transparent / muted)

export type CellMeta = {
  col: number;
  row: number;
  kind: CellKind;
  /** For perim-*: global perimeter index 0..51 */
  globalPos?: number;
  /** Owner colour for: base, base-rim, perim-start, perim-star (none), home-*, centre */
  owner?: PlayerColour;
  /** For base pads only: slot 0..3 */
  baseSlot?: number;
  /** For home-lane cells: local position 52..57 */
  homeLocalPos?: number;
  /** Whether the cell is safe (no capture allowed when standing on it). */
  safe?: boolean;
};

const STARS_SET = new Set(STAR_SAFE_GLOBALS);
const STARTS_SET = new Set(Object.values(COLOUR_START_GLOBAL_POS));
const HOME_ENTRIES_SET = new Set(Object.values(COLOUR_HOME_ENTRY_POS));

/** Lookup: global position → owner colour for start cells. */
const START_OWNER: Record<number, PlayerColour> = {};
for (const c of COLOURS) {
  START_OWNER[COLOUR_START_GLOBAL_POS[c]] = c;
}

/** Lookup: global position → owner colour for home-entry cells. */
const HOME_ENTRY_OWNER: Record<number, PlayerColour> = {};
for (const c of COLOURS) {
  HOME_ENTRY_OWNER[COLOUR_HOME_ENTRY_POS[c]] = c;
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

let _cellMap: Map<string, CellMeta> | null = null;

/**
 * Compute (and cache) the complete cell metadata map for the 15×15 board.
 * Every (col, row) is classified; unused cells are "background".
 */
export function getCellMap(): Map<string, CellMeta> {
  if (_cellMap) return _cellMap;
  const map = new Map<string, CellMeta>();

  // 1. Default every cell to background.
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      map.set(cellKey(col, row), { col, row, kind: "background" });
    }
  }

  // 2. Base rectangles → base-rim, then overwrite the 4 pads as base.
  for (const colour of COLOURS) {
    const rect = BASE_RECTS[colour];
    for (let c = rect.col; c < rect.col + rect.w; c++) {
      for (let r = rect.row; r < rect.row + rect.h; r++) {
        map.set(cellKey(c, r), { col: c, row: r, kind: "base-rim", owner: colour });
      }
    }
    BASE_CELL_COORDINATES[colour].forEach(([c, r], slot) => {
      map.set(cellKey(c, r), {
        col: c,
        row: r,
        kind: "base",
        owner: colour,
        baseSlot: slot,
        safe: true,
      });
    });
  }

  // 3. Perimeter path (52 cells).
  PATH_COORDINATES.forEach(([c, r], globalPos) => {
    let kind: CellKind = "perim";
    let owner: PlayerColour | undefined;
    let safe = false;

    if (STARTS_SET.has(globalPos)) {
      kind = "perim-start";
      owner = START_OWNER[globalPos];
      safe = true;
    } else if (STARS_SET.has(globalPos)) {
      kind = "perim-star";
      safe = true;
    } else if (HOME_ENTRIES_SET.has(globalPos)) {
      kind = "home-entry";
      owner = HOME_ENTRY_OWNER[globalPos];
    }

    map.set(cellKey(c, r), { col: c, row: r, kind, globalPos, owner, safe });
  });

  // 4. Home lanes (4 colours × 6 cells, local pos 52..57).
  for (const colour of COLOURS) {
    HOME_LANE_COORDINATES[colour].forEach(([c, r], i) => {
      const localPos = HOME_LANE_START_LOCAL + i;
      map.set(cellKey(c, r), {
        col: c,
        row: r,
        kind: localPos === HOME_LANE_END_LOCAL ? "home-final" : "home-lane",
        owner: colour,
        homeLocalPos: localPos,
        safe: true,
      });
    });
  }

  // 5. Centre + decorative inside corners.
  const [cc, cr] = CENTRE_CELL;
  map.set(cellKey(cc, cr), { col: cc, row: cr, kind: "centre", safe: true });
  for (const [c, r] of CENTRE_CORNER_CELLS) {
    map.set(cellKey(c, r), { col: c, row: r, kind: "centre-corner" });
  }

  _cellMap = map;
  return map;
}

export function getCell(col: number, row: number): CellMeta | undefined {
  return getCellMap().get(cellKey(col, row));
}

/** Convert a token's logical position into [col, row] on the board. */
export function tokenLocalToCell(
  colour: PlayerColour,
  localPosition: number,
  slotInBase = 0
): [number, number] {
  if (localPosition === BASE_POSITION) {
    const pads = BASE_CELL_COORDINATES[colour];
    return pads[Math.min(slotInBase, pads.length - 1)];
  }
  if (localPosition >= 0 && localPosition < PERIMETER_LENGTH) {
    const offset = COLOUR_START_GLOBAL_POS[colour];
    const global = (offset + localPosition) % PERIMETER_LENGTH;
    return PATH_COORDINATES[global];
  }
  if (localPosition >= HOME_LANE_START_LOCAL && localPosition <= HOME_LANE_END_LOCAL) {
    return HOME_LANE_COORDINATES[colour][localPosition - HOME_LANE_START_LOCAL];
  }
  return CENTRE_CELL;
}

/** Convert a local position to its corresponding global perimeter index, or -1 if not on the perimeter. */
export function localToGlobal(colour: PlayerColour, localPosition: number): number {
  if (localPosition < 0 || localPosition >= PERIMETER_LENGTH) return -1;
  return (COLOUR_START_GLOBAL_POS[colour] + localPosition) % PERIMETER_LENGTH;
}

export function isSafeGlobal(globalPos: number): boolean {
  return SAFE_SQUARES.includes(globalPos);
}

export { COLOUR_START_GLOBAL_POS, COLOUR_HOME_ENTRY_POS, PATH_COORDINATES, HOME_LANE_COORDINATES, BASE_CELL_COORDINATES, BASE_RECTS, CENTRE_CELL };
