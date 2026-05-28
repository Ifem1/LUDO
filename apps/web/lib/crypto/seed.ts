"use client";

const STORAGE_PREFIX = "ludoproof_seed";

function storageKey(gameId: string, walletAddress: string): string {
  return `${STORAGE_PREFIX}:${gameId}:${walletAddress.toLowerCase()}`;
}

export function generateSeed(walletAddress: string): string {
  const rand = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${rand}-${walletAddress.toLowerCase()}-${Date.now()}`;
}

export function saveLocalSeed(gameId: string, wallet: string, seed: string): void {
  try {
    localStorage.setItem(storageKey(gameId, wallet), seed);
  } catch {
    // localStorage unavailable
  }
}

export function getLocalSeed(gameId: string, wallet: string): string | null {
  try {
    return localStorage.getItem(storageKey(gameId, wallet));
  } catch {
    return null;
  }
}

export function hasLocalSeed(gameId: string, wallet: string): boolean {
  return getLocalSeed(gameId, wallet) !== null;
}

export function deleteLocalSeed(gameId: string, wallet: string): void {
  try {
    localStorage.removeItem(storageKey(gameId, wallet));
  } catch {
    // ignore
  }
}
