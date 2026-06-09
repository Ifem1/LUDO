export type ContractWriteResult = {
  txHash: string | null;
  ok: boolean;
  error?: string;
  data?: unknown;
};

export type ContractCallStatus = "idle" | "pending" | "success" | "error";

export type GenLayerError = {
  code: string;
  message: string;
  raw?: unknown;
};

export type RawGameContract = {
  game_id: string;
  creator: string;
  status: string;
  mode?: string;
  max_players: number;
  players: RawPlayerContract[];
  current_turn_index: number;
  /** Two-dice variant: array of two values, or null. */
  current_dice: number[] | null;
  /** Dice values not yet spent in the active roll. */
  dice_remaining: number[];
  current_roll_nonce: number;
  consecutive_doubles: number;
  move_count: number;
  must_move: boolean;
  winner: string | null;
  created_at: number;
  completed_at: number | null;
  move_history: RawMoveContract[];
};

export type RawPlayerContract = {
  address: string;
  colour: string;
  tokens: number[];
  seed_commitment: string | null;
  has_committed_seed: boolean;
  has_revealed_seed: boolean;
  forfeited?: boolean;
  is_ai?: boolean;
  joined_at: number;
};

export type RawDisputeContract = {
  dispute_id: string;
  game_id: string;
  claimant: string;
  move_number: number;
  claim: string;
  status: "pending" | "resolved";
  ruling: "upheld" | "rejected" | null;
  rationale: string | null;
};

export type RawMoveContract = {
  moveNumber: number;
  player: string;
  colour: string;
  moveType: string;
  timestamp: number;
  /** Single die value for "move", [d1, d2] for "roll". */
  dice?: number | number[];
  tokenIndex?: number;
  from?: number;
  to?: number;
  capturedPlayer?: string;
  capturedTokenIndex?: number;
  reason?: string;
};

export type RawStatsContract = {
  player: string;
  games_played: number;
  wins: number;
  losses: number;
  captures: number;
  forfeits: number;
  total_moves: number;
  win_rate?: number;
  last_played_at: number;
};

/** Shape returned by `get_valid_moves` in the two-dice variant. */
export type ValidMovesContract = {
  per_die: Array<{ die: number; tokens: number[] }>;
  remaining: number[];
};
