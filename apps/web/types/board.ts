import type { PlayerColour } from "@ludoproof/shared";

export type CellType =
  | "empty"
  | "path"
  | "safe"
  | "base-red"
  | "base-blue"
  | "base-yellow"
  | "base-green"
  | "home-red"
  | "home-blue"
  | "home-yellow"
  | "home-green"
  | "centre"
  | "blocked";

export type BoardCell = {
  col: number;
  row: number;
  type: CellType;
  pathIndex?: number;
  homeLaneColour?: PlayerColour;
  homeLaneIndex?: number;
  baseColour?: PlayerColour;
  baseSlot?: number;
};

export type TokenRenderPosition = {
  col: number;
  row: number;
  inBase: boolean;
  baseSlot?: number;
};
