/**
 * Authentic Ludo board geometry on a 15×15 grid.
 *
 * Layout (matches the contract's COLOUR_OFFSETS = {red:0, blue:13, yellow:26, green:39}):
 *
 *   Bases (6×6):
 *     RED    top-left      cols 0–5,  rows 0–5
 *     BLUE   top-right     cols 9–14, rows 0–5
 *     YELLOW bottom-right  cols 9–14, rows 9–14
 *     GREEN  bottom-left   cols 0–5,  rows 9–14
 *
 *   Cross arms (3-wide), with the middle row/column being each colour's home column:
 *     LEFT   arm cols 0–5,  rows 6–8  → RED    home column on row 7
 *     TOP    arm cols 6–8,  rows 0–5  → BLUE   home column on col 7
 *     RIGHT  arm cols 9–14, rows 6–8  → YELLOW home column on row 7
 *     BOTTOM arm cols 6–8,  rows 9–14 → GREEN  home column on col 7
 *
 *   Centre cell (7, 7) = victory square (token position 58).
 *
 * Outer path (52 cells, clockwise starting at RED's exit (0, 6)):
 *   – RED    start (safe)  at global 0  → (0, 6)
 *   – BLUE   start (safe)  at global 13 → (8, 0)
 *   – YELLOW start (safe)  at global 26 → (14, 8)
 *   – GREEN  start (safe)  at global 39 → (6, 14)
 *   – Star safe squares at globals 8, 21, 34, 47
 *
 * Home column entries (perimeter cell that a colour's token leaves on to
 * enter its own home column) sit at global (start - 1) mod 52:
 *   – RED    home entry global 51 → (0, 7)  enters (1, 7)
 *   – BLUE   home entry global 12 → (7, 0)  enters (7, 1)
 *   – YELLOW home entry global 25 → (14, 7) enters (13, 7)
 *   – GREEN  home entry global 38 → (7, 14) enters (7, 13)
 *
 * At the four inside corners of the centre junction ((6,6) (8,6) (8,8) (6,8))
 * the perimeter path turns 90° diagonally — those cells are NOT walked on.
 */

/**
 * 52 [col, row] pairs in clockwise order starting at RED's exit (1, 6).
 *
 * Start positions per the requested arrangement:
 *   RED    pos  0 → (1, 6)   second cell from corner on LEFT arm top edge
 *   BLUE   pos 13 → (8, 1)   second cell from corner on TOP arm right edge
 *   YELLOW pos 26 → (13, 8)  second cell from corner on RIGHT arm bottom edge
 *   GREEN  pos 39 → (6, 13)  second cell from corner on BOTTOM arm left edge
 *
 * The 4 inside-corner cells (6,6), (8,6), (8,8), (6,8) are decorative
 * (not on the perimeter loop). The path turns the corner diagonally there.
 */
export const PATH_COORDINATES: [number, number][] = [
  // RED segment 0–12
  [1, 6],  // 0   RED start (safe)
  [2, 6],  // 1
  [3, 6],  // 2
  [4, 6],  // 3
  [5, 6],  // 4
  [6, 5],  // 5   diagonal turn at NW corner
  [6, 4],  // 6
  [6, 3],  // 7
  [6, 2],  // 8   safe star
  [6, 1],  // 9
  [6, 0],  // 10
  [7, 0],  // 11
  [8, 0],  // 12  BLUE home-column entry

  // BLUE segment 13–25
  [8, 1],  // 13  BLUE start (safe)
  [8, 2],  // 14
  [8, 3],  // 15
  [8, 4],  // 16
  [8, 5],  // 17
  [9, 6],  // 18  diagonal turn at NE corner
  [10, 6], // 19
  [11, 6], // 20
  [12, 6], // 21  safe star
  [13, 6], // 22
  [14, 6], // 23
  [14, 7], // 24
  [14, 8], // 25  YELLOW home-column entry

  // YELLOW segment 26–38
  [13, 8], // 26  YELLOW start (safe)
  [12, 8], // 27
  [11, 8], // 28
  [10, 8], // 29
  [9, 8],  // 30
  [8, 9],  // 31  diagonal turn at SE corner
  [8, 10], // 32
  [8, 11], // 33
  [8, 12], // 34  safe star
  [8, 13], // 35
  [8, 14], // 36
  [7, 14], // 37
  [6, 14], // 38  GREEN home-column entry

  // GREEN segment 39–51
  [6, 13], // 39  GREEN start (safe)
  [6, 12], // 40
  [6, 11], // 41
  [6, 10], // 42
  [6, 9],  // 43
  [5, 8],  // 44  diagonal turn at SW corner
  [4, 8],  // 45
  [3, 8],  // 46
  [2, 8],  // 47  safe star
  [1, 8],  // 48
  [0, 8],  // 49
  [0, 7],  // 50
  [0, 6],  // 51  RED home-column entry
];

/**
 * Home lanes per colour, ordered from the perimeter entry side (token's
 * first step inside the home column, local position 52) to the cell
 * adjacent to the centre (local position 57). Local 58 is the centre.
 */
export const HOME_LANE_COORDINATES: Record<string, [number, number][]> = {
  red:    [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  blue:   [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
  green:  [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
};

/**
 * 4 spawn pads per colour, arranged 2×2 inside the 6×6 base so they
 * render as the classic four-circle Ludo base.
 */
export const BASE_CELL_COORDINATES: Record<string, [number, number][]> = {
  red:    [[1, 1], [4, 1], [1, 4], [4, 4]],
  blue:   [[10, 1], [13, 1], [10, 4], [13, 4]],
  yellow: [[10, 10], [13, 10], [10, 13], [13, 13]],
  green:  [[1, 10], [4, 10], [1, 13], [4, 13]],
};

/** Base outer rectangles for visual rendering (col, row, w, h). */
export const BASE_RECTS: Record<string, { col: number; row: number; w: number; h: number }> = {
  red:    { col: 0, row: 0, w: 6, h: 6 },
  blue:   { col: 9, row: 0, w: 6, h: 6 },
  yellow: { col: 9, row: 9, w: 6, h: 6 },
  green:  { col: 0, row: 9, w: 6, h: 6 },
};

/** Centre victory cell. */
export const CENTRE_CELL: [number, number] = [7, 7];

/** Four inside-corner cells of the centre junction. Decorative only. */
export const CENTRE_CORNER_CELLS: [number, number][] = [
  [6, 6],
  [8, 6],
  [8, 8],
  [6, 8],
];

/** Global perimeter index of each colour's start square. */
export const COLOUR_START_GLOBAL_POS: Record<string, number> = {
  red: 0,
  blue: 13,
  yellow: 26,
  green: 39,
};

/** Global perimeter index of each colour's home-column entry. */
export const COLOUR_HOME_ENTRY_POS: Record<string, number> = {
  red: 51,
  blue: 12,
  yellow: 25,
  green: 38,
};
