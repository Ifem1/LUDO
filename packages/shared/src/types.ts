export type PlayerColour = "red" | "blue" | "yellow" | "green";

export type GameStatus =
  | "waiting"
  | "seed_commit"
  | "active"
  | "completed"
  | "cancelled"
  | "forfeited";

export type PlayerState = {
  address: string;
  colour: PlayerColour;
  tokens: [number, number, number, number];
  seedCommitment: string | null;
  hasCommittedSeed: boolean;
  hasRevealedSeed: boolean;
  forfeited?: boolean;
  joinedAt: number;
};

export type GameState = {
  gameId: string;
  creator: string;
  status: GameStatus;
  maxPlayers: 2 | 3 | 4;
  players: PlayerState[];
  currentTurnIndex: number;
  /** Both dice values for the active roll, or null if no roll is in flight. */
  currentDice: [number, number] | null;
  /** Dice values from the active roll that have not yet been played. */
  diceRemaining: number[];
  currentRollNonce: number;
  /** Counter for back-to-back doubles. Third consecutive double cancels the roll. */
  consecutiveDoubles: number;
  moveCount: number;
  mustMove: boolean;
  winner: string | null;
  createdAt: number;
  completedAt: number | null;
  moveHistory: MoveRecord[];
};

export type MoveRecord = {
  moveNumber: number;
  player: string;
  colour: PlayerColour | "";
  moveType:
    | "roll"
    | "move"
    | "capture"
    | "forfeit"
    | "win"
    | "cancel"
    | "no_move"
    | "three_sixes";
  /** For "roll" records this is `[d1, d2]`. For "move" records it's the die value spent. */
  dice?: number | [number, number];
  tokenIndex?: number;
  from?: number;
  to?: number;
  capturedPlayer?: string;
  capturedTokenIndex?: number;
  reason?: string;
  timestamp: number;
};

export type PlayerStats = {
  player: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  captures: number;
  forfeits: number;
  totalMoves: number;
  winRate: number;
  lastPlayedAt: number;
};
