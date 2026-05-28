import type { PlayerColour } from "./types";

export const COLOUR_OFFSETS: Record<PlayerColour, number> = {
  red: 0,
  blue: 13,
  yellow: 26,
  green: 39,
};

export const SAFE_SQUARES: readonly number[] = [0, 8, 13, 21, 26, 34, 39, 47];

export const COLOURS: readonly PlayerColour[] = ["red", "blue", "yellow", "green"];

export const BOARD_SIZE = 15;
export const PATH_LENGTH = 52;
export const HOME_LANE_START = 52;
export const HOME_LANE_END = 57;
export const FINISH_POSITION = 58;
export const BASE_POSITION = -1;
