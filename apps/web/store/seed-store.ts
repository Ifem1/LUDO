import { create } from "zustand";

type SeedEntry = {
  rawSeed: string;
  commitment: string;
  committed: boolean;
};

type SeedStore = {
  seeds: Record<string, SeedEntry>;
  setSeed: (key: string, entry: SeedEntry) => void;
  getSeed: (key: string) => SeedEntry | null;
  markCommitted: (key: string) => void;
};

export const useSeedStore = create<SeedStore>((set, get) => ({
  seeds: {},
  setSeed: (key, entry) =>
    set((s) => ({ seeds: { ...s.seeds, [key]: entry } })),
  getSeed: (key) => get().seeds[key] ?? null,
  markCommitted: (key) =>
    set((s) => {
      const entry = s.seeds[key];
      if (!entry) return s;
      return { seeds: { ...s.seeds, [key]: { ...entry, committed: true } } };
    }),
}));

export function seedStoreKey(gameId: string, wallet: string): string {
  return `${gameId}:${wallet.toLowerCase()}`;
}
