"use client";

import { useCallback } from "react";
import { useSeedStore, seedStoreKey } from "@/store/seed-store";
import { generateSeed, saveLocalSeed, getLocalSeed } from "@/lib/crypto/seed";
import { sha256Hex } from "@/lib/crypto/sha256";
import { useWallet } from "./useWallet";

export function useLocalSeed(gameId: string) {
  const { address } = useWallet();
  const { setSeed, getSeed, markCommitted } = useSeedStore();

  const storeKey = address ? seedStoreKey(gameId, address) : null;

  const prepareSeed = useCallback(async (): Promise<{ rawSeed: string; commitment: string }> => {
    if (!address) throw new Error("wallet_not_connected");
    const key = seedStoreKey(gameId, address);
    const existing = getSeed(key);
    if (existing) return { rawSeed: existing.rawSeed, commitment: existing.commitment };

    const raw = generateSeed(address);
    saveLocalSeed(gameId, address, raw);
    const commitment = await sha256Hex(raw);
    setSeed(key, { rawSeed: raw, commitment, committed: false });
    return { rawSeed: raw, commitment };
  }, [address, gameId, getSeed, setSeed]);

  const getStoredSeed = useCallback((): string | null => {
    if (!address) return null;
    const inStore = getSeed(seedStoreKey(gameId, address));
    if (inStore) return inStore.rawSeed;
    return getLocalSeed(gameId, address);
  }, [address, gameId, getSeed]);

  const hasSeed = useCallback((): boolean => {
    return Boolean(getStoredSeed());
  }, [getStoredSeed]);

  const confirmCommitted = useCallback(() => {
    if (!storeKey) return;
    markCommitted(storeKey);
  }, [storeKey, markCommitted]);

  const seedEntry = storeKey ? getSeed(storeKey) : null;

  return { prepareSeed, getStoredSeed, hasSeed, confirmCommitted, seedEntry };
}
