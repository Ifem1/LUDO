"use client";

import { useAuthStore } from "@/store/auth-store";

/**
 * Compatibility shim. Before the embedded-wallet rewrite this hook returned
 * the connected external wallet (MetaMask via wagmi). It now returns the
 * decrypted, in-memory embedded wallet from the auth store. The shape is
 * preserved so the rest of the app keeps working without changes.
 */
export function useWallet() {
  const { email, address, account } = useAuthStore();
  return {
    address: address ?? undefined,
    isConnected: Boolean(account),
    shortAddress: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null,
    email,
    account,
  };
}
