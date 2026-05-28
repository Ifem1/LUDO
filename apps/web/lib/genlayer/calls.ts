"use client";

import { getGenLayerClient } from "./client";
import { getContractAddress } from "./contract";
import { parseGameState, parsePlayerStats, safeJsonParse } from "./parser";
import { useAuthStore } from "@/store/auth-store";
import type { GameState, PlayerStats } from "@ludoproof/shared";
import type { RawGameContract, RawStatsContract, ValidMovesContract } from "@/types/contract";

type Account = `0x${string}`;

async function readContract(method: string, args: unknown[]): Promise<unknown> {
  const client = getGenLayerClient();
  const address = getContractAddress();
  const result = await (client as any).readContract({
    address,
    functionName: method,
    args,
  });
  return result;
}

async function writeContract(
  _expectedAddress: Account,
  method: string,
  args: unknown[]
): Promise<string> {
  const viemAccount = useAuthStore.getState().account;
  if (!viemAccount) {
    throw new Error("not_signed_in");
  }

  const client = getGenLayerClient({ withAccount: true });
  const address = getContractAddress();

  const hash = await (client as any).writeContract({
    account: viemAccount,
    address,
    functionName: method,
    args,
    value: 0n,
  });

  // genlayer-js may return a transaction hash string OR an object — normalise.
  if (typeof hash === "string") return hash;
  if (hash && typeof hash === "object" && "hash" in hash) {
    return String((hash as { hash: unknown }).hash);
  }
  return String(hash);
}

export async function glCreateGame(
  account: Account,
  gameId: string,
  maxPlayers: number
): Promise<string> {
  return writeContract(account, "create_game", [gameId, BigInt(maxPlayers)]);
}

export async function glJoinGame(
  account: Account,
  gameId: string,
  colour: string
): Promise<string> {
  return writeContract(account, "join_game", [gameId, colour]);
}

export async function glCommitSeed(
  account: Account,
  gameId: string,
  seedHash: string
): Promise<string> {
  return writeContract(account, "commit_seed", [gameId, seedHash]);
}

export async function glStartGame(account: Account, gameId: string): Promise<string> {
  return writeContract(account, "start_game", [gameId]);
}

export async function glRollDice(
  account: Account,
  gameId: string,
  rawSeed: string
): Promise<string> {
  return writeContract(account, "roll_dice", [gameId, rawSeed]);
}

export async function glSubmitMove(
  account: Account,
  gameId: string,
  tokenIndex: number,
  dieValue: number
): Promise<string> {
  return writeContract(account, "submit_move", [
    gameId,
    BigInt(tokenIndex),
    BigInt(dieValue),
  ]);
}

export async function glForfeitGame(account: Account, gameId: string): Promise<string> {
  return writeContract(account, "forfeit_game", [gameId]);
}

export async function glCancelGame(account: Account, gameId: string): Promise<string> {
  return writeContract(account, "cancel_game", [gameId]);
}

export async function glGetGame(gameId: string): Promise<GameState | null> {
  try {
    const raw = await readContract("get_game", [gameId]);
    const parsed = safeJsonParse<RawGameContract>(raw);
    if (!parsed) return null;
    return parseGameState(parsed);
  } catch {
    return null;
  }
}

export async function glGetValidMoves(gameId: string): Promise<ValidMovesContract> {
  try {
    const raw = await readContract("get_valid_moves", [gameId]);
    const parsed = safeJsonParse<ValidMovesContract>(raw);
    return parsed ?? { per_die: [], remaining: [] };
  } catch {
    return { per_die: [], remaining: [] };
  }
}

export async function glGetLeaderboard(limit: number): Promise<PlayerStats[]> {
  try {
    const raw = await readContract("get_leaderboard", [BigInt(limit)]);
    const parsed = safeJsonParse<RawStatsContract[]>(raw);
    if (!parsed) return [];
    return parsed.map(parsePlayerStats);
  } catch {
    return [];
  }
}

export async function glGetRecentGames(limit: number): Promise<unknown[]> {
  try {
    const raw = await readContract("get_recent_games", [BigInt(limit)]);
    return safeJsonParse<unknown[]>(raw) ?? [];
  } catch {
    return [];
  }
}

export async function glGetOpenGames(limit: number): Promise<unknown[]> {
  try {
    const raw = await readContract("get_open_games", [BigInt(limit)]);
    return safeJsonParse<unknown[]>(raw) ?? [];
  } catch {
    return [];
  }
}

export async function glGetPlayerStats(player: string): Promise<PlayerStats | null> {
  try {
    const raw = await readContract("get_player_stats", [player]);
    const parsed = safeJsonParse<RawStatsContract>(raw);
    if (!parsed) return null;
    return parsePlayerStats(parsed);
  } catch {
    return null;
  }
}

export async function glGetMoveHistory(gameId: string): Promise<unknown[]> {
  try {
    const raw = await readContract("get_move_history", [gameId]);
    return safeJsonParse<unknown[]>(raw) ?? [];
  } catch {
    return [];
  }
}

export async function glGetContractVersion(): Promise<string> {
  try {
    const raw = await readContract("contract_version", []);
    return typeof raw === "string" ? raw : String(raw);
  } catch {
    return "unknown";
  }
}
