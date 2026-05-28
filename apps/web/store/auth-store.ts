"use client";

import { create } from "zustand";
import type { PrivateKeyAccount } from "viem/accounts";

/**
 * Holds the *decrypted* viem account for the currently signed-in user.
 * Never persisted to disk — re-authentication required after a hard refresh.
 */
type AuthStore = {
  email: string | null;
  address: `0x${string}` | null;
  account: PrivateKeyAccount | null;
  signIn: (params: { email: string; address: `0x${string}`; account: PrivateKeyAccount }) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  email: null,
  address: null,
  account: null,
  signIn: ({ email, address, account }) => set({ email, address, account }),
  signOut: () => set({ email: null, address: null, account: null }),
}));
