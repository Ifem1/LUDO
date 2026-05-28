import type { GameState, PlayerState, MoveRecord, PlayerColour, PlayerStats } from "@ludoproof/shared";
import type { RawGameContract, RawPlayerContract, RawMoveContract, RawStatsContract } from "@/types/contract";

export function parseGameState(raw: RawGameContract): GameState {
  const dice = Array.isArray(raw.current_dice) && raw.current_dice.length === 2
    ? ([raw.current_dice[0], raw.current_dice[1]] as [number, number])
    : null;

  return {
    gameId: raw.game_id,
    creator: raw.creator,
    status: raw.status as GameState["status"],
    maxPlayers: raw.max_players as 2 | 3 | 4,
    players: raw.players.map(parsePlayerState),
    currentTurnIndex: raw.current_turn_index,
    currentDice: dice,
    diceRemaining: Array.isArray(raw.dice_remaining) ? raw.dice_remaining : [],
    currentRollNonce: raw.current_roll_nonce,
    consecutiveDoubles: raw.consecutive_doubles ?? 0,
    moveCount: raw.move_count,
    mustMove: raw.must_move,
    winner: raw.winner,
    createdAt: raw.created_at,
    completedAt: raw.completed_at,
    moveHistory: (raw.move_history ?? []).map(parseMoveRecord),
  };
}

function parsePlayerState(raw: RawPlayerContract): PlayerState {
  return {
    address: raw.address,
    colour: raw.colour as PlayerColour,
    tokens: raw.tokens as [number, number, number, number],
    seedCommitment: raw.seed_commitment,
    hasCommittedSeed: raw.has_committed_seed,
    hasRevealedSeed: raw.has_revealed_seed,
    forfeited: raw.forfeited ?? false,
    joinedAt: raw.joined_at,
  };
}

function parseMoveRecord(raw: RawMoveContract): MoveRecord {
  let dice: MoveRecord["dice"];
  if (Array.isArray(raw.dice) && raw.dice.length === 2) {
    dice = [raw.dice[0], raw.dice[1]];
  } else if (typeof raw.dice === "number") {
    dice = raw.dice;
  }

  return {
    moveNumber: raw.moveNumber,
    player: raw.player,
    colour: raw.colour as PlayerColour | "",
    moveType: raw.moveType as MoveRecord["moveType"],
    timestamp: raw.timestamp,
    dice,
    tokenIndex: raw.tokenIndex,
    from: raw.from,
    to: raw.to,
    capturedPlayer: raw.capturedPlayer,
    capturedTokenIndex: raw.capturedTokenIndex,
    reason: raw.reason,
  };
}

export function parsePlayerStats(raw: RawStatsContract): PlayerStats {
  const played = raw.games_played ?? 0;
  const wins = raw.wins ?? 0;
  const winRate = played > 0 ? Math.round((wins / played) * 10000) : 0;
  return {
    player: raw.player,
    gamesPlayed: played,
    wins,
    losses: raw.losses ?? 0,
    captures: raw.captures ?? 0,
    forfeits: raw.forfeits ?? 0,
    totalMoves: raw.total_moves ?? 0,
    winRate: raw.win_rate ?? winRate,
    lastPlayedAt: raw.last_played_at ?? 0,
  };
}

export function safeJsonParse<T>(value: unknown): T | null {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (value !== null && typeof value === "object") {
    return value as T;
  }
  return null;
}
