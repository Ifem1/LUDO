export const APP_NAME = "LudoProof";
export const POLL_INTERVAL_WAITING = 5000;
export const POLL_INTERVAL_ACTIVE = 3000;
export const LEADERBOARD_LIMIT = 50;
export const RECENT_GAMES_LIMIT = 50;
export const OPEN_GAMES_LIMIT = 20;

export const PLAYER_COLOURS = ["red", "blue", "yellow", "green"] as const;

export const COLOUR_HEX: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  yellow: "#EAB308",
  green: "#22C55E",
};

export const COLOUR_BG: Record<string, string> = {
  red: "bg-player-red",
  blue: "bg-player-blue",
  yellow: "bg-player-yellow",
  green: "bg-player-green",
};

export const COLOUR_TEXT: Record<string, string> = {
  red: "text-player-red",
  blue: "text-player-blue",
  yellow: "text-player-yellow",
  green: "text-player-green",
};

export const COLOUR_BORDER: Record<string, string> = {
  red: "border-player-red",
  blue: "border-player-blue",
  yellow: "border-player-yellow",
  green: "border-player-green",
};

export const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting for Players",
  seed_commit: "Committing Seeds",
  active: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  forfeited: "Forfeited",
};
