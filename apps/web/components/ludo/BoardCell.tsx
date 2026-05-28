"use client";

import type { CellMeta } from "@/lib/ludo/path";
import { cellStyle, COLOUR_RAMPS } from "@/lib/ludo/board";

type Props = {
  meta: CellMeta;
  highlighted?: boolean;
  children?: React.ReactNode;
};

export function BoardCell({ meta, highlighted, children }: Props) {
  const style: React.CSSProperties = {
    ...cellStyle(meta),
    boxShadow: highlighted
      ? "inset 0 0 0 2px #6D28D9, 0 0 12px rgba(109,40,217,0.45)"
      : undefined,
  };

  const showStar = meta.kind === "perim-star" && !children;
  const showStartMarker = meta.kind === "perim-start" && !children;
  const showHomeArrow = meta.kind === "home-entry" && !children;

  return (
    <div className="board-cell relative" style={style}>
      {/* Faint decorations */}
      {meta.kind === "centre-corner" && meta.col != null && (
        <CornerTriangle col={meta.col} row={meta.row} />
      )}

      {showStar && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-accent-gold opacity-80">
          ★
        </span>
      )}

      {showStartMarker && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          ★
        </span>
      )}

      {showHomeArrow && meta.owner && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          ▾
        </span>
      )}

      {/* Tokens / overlays */}
      {children && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * The four cells of the inside-corner of the centre junction render as
 * coloured triangles pointing toward the centre — visually completing
 * the classic "home triangle" look without being walked on.
 */
function CornerTriangle({ col, row }: { col: number; row: number }) {
  // Decide which two home colours' triangles meet at this corner.
  // (6,6) NW: red (left of centre) + blue (top of centre)
  // (8,6) NE: blue + yellow
  // (8,8) SE: yellow + green
  // (6,8) SW: green + red
  const key = `${col},${row}`;
  const pairs: Record<string, [string, string]> = {
    "6,6": [COLOUR_RAMPS.red.fill, COLOUR_RAMPS.blue.fill],
    "8,6": [COLOUR_RAMPS.blue.fill, COLOUR_RAMPS.yellow.fill],
    "8,8": [COLOUR_RAMPS.yellow.fill, COLOUR_RAMPS.green.fill],
    "6,8": [COLOUR_RAMPS.green.fill, COLOUR_RAMPS.red.fill],
  };
  const colours = pairs[key];
  if (!colours) return null;

  // Each cell is split diagonally between two colours, pointing into centre.
  // Use clip-path polygons for clean triangles.
  let topPolygon = "0 0, 100% 0, 100% 100%"; // default
  let bottomPolygon = "0 0, 100% 100%, 0 100%";

  switch (key) {
    case "6,6": // NW corner: triangles point toward SE
      topPolygon = "0 0, 100% 0, 100% 100%";    // top-right triangle (blue arm)
      bottomPolygon = "0 0, 100% 100%, 0 100%"; // bottom-left triangle (red arm)
      break;
    case "8,6": // NE corner: triangles point toward SW
      topPolygon = "0 0, 100% 0, 0 100%";       // top-left triangle (blue arm)
      bottomPolygon = "100% 0, 100% 100%, 0 100%"; // bottom-right triangle (yellow arm)
      break;
    case "8,8": // SE corner: triangles point toward NW
      topPolygon = "100% 0, 100% 100%, 0 100%"; // bottom-right triangle (yellow arm)
      bottomPolygon = "0 0, 100% 0, 0 100%";    // top-left triangle (green arm)
      break;
    case "6,8": // SW corner: triangles point toward NE
      topPolygon = "0 0, 100% 0, 0 100%";       // top-left triangle (red arm)
      bottomPolygon = "100% 0, 100% 100%, 0 100%"; // bottom-right triangle (green arm)
      break;
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: colours[0], clipPath: `polygon(${topPolygon})` }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: colours[1], clipPath: `polygon(${bottomPolygon})` }}
      />
    </>
  );
}
