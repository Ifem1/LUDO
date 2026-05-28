/**
 * Visual geometry helpers for the board renderer. Pure functions that take
 * a cell or token and return inline-style hints / class names.
 */

import type { PlayerColour } from "@ludoproof/shared";
import type { CellMeta } from "./path";

/** Authentic Ludo colour ramps (deep base, mid fill, soft tint). */
export const COLOUR_RAMPS: Record<PlayerColour, { deep: string; fill: string; tint: string; ink: string }> = {
  red:    { deep: "#B91C1C", fill: "#EF4444", tint: "#FEE2E2", ink: "#7F1D1D" },
  blue:   { deep: "#1D4ED8", fill: "#3B82F6", tint: "#DBEAFE", ink: "#1E3A8A" },
  yellow: { deep: "#CA8A04", fill: "#EAB308", tint: "#FEF9C3", ink: "#713F12" },
  green:  { deep: "#15803D", fill: "#22C55E", tint: "#DCFCE7", ink: "#14532D" },
};

/** Inline style for the body of a single cell, based on its semantic kind. */
export function cellStyle(meta: CellMeta): React.CSSProperties {
  const base: React.CSSProperties = {
    gridColumn: meta.col + 1,
    gridRow: meta.row + 1,
    borderColor: "rgba(31, 31, 31, 0.10)",
  };

  switch (meta.kind) {
    case "background":
    case "centre-corner":
      return { ...base, backgroundColor: "#F8F7FF" };

    case "base-rim": {
      const c = COLOUR_RAMPS[meta.owner!];
      return { ...base, backgroundColor: c.fill, borderColor: c.deep };
    }
    case "base": {
      const c = COLOUR_RAMPS[meta.owner!];
      return { ...base, backgroundColor: "#FFFFFF", borderColor: c.deep };
    }

    case "home-lane":
    case "home-final": {
      const c = COLOUR_RAMPS[meta.owner!];
      return { ...base, backgroundColor: c.fill, borderColor: c.deep };
    }

    case "centre":
      return { ...base, backgroundColor: "#6D28D9" };

    case "perim-start": {
      const c = COLOUR_RAMPS[meta.owner!];
      return {
        ...base,
        backgroundColor: c.fill,
        borderColor: c.deep,
      };
    }

    case "perim-star":
      return {
        ...base,
        backgroundColor: "#FEF3C7",
        borderColor: "#F59E0B",
      };

    case "home-entry": {
      // Subtle tint so the home-entry reads as a "doorway" into the home
      // column rather than blending into it.
      const c = COLOUR_RAMPS[meta.owner!];
      return {
        ...base,
        backgroundColor: c.tint,
        borderColor: c.fill,
      };
    }

    case "perim":
    default:
      return { ...base, backgroundColor: "#FFFFFF" };
  }
}

/** True if the cell should glow when it's a legal landing square. */
export function cellAcceptsHighlight(meta: CellMeta): boolean {
  return (
    meta.kind === "perim" ||
    meta.kind === "perim-start" ||
    meta.kind === "perim-star" ||
    meta.kind === "home-entry" ||
    meta.kind === "home-lane" ||
    meta.kind === "home-final" ||
    meta.kind === "centre" ||
    meta.kind === "base"
  );
}
