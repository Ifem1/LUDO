"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { env } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";

/**
 * Build a fresh GenLayer client. We do NOT cache it as a module-level
 * singleton anymore because the bound account changes whenever the user
 * signs in or out, and reusing a client with a stale account would sign
 * with the wrong key.
 *
 * For reads (no signing needed), the account can be omitted.
 */
export function getGenLayerClient(opts?: { withAccount?: boolean }) {
  const account = opts?.withAccount ? useAuthStore.getState().account : null;

  return createClient({
    chain: studionet,
    endpoint: env.rpcUrl || undefined,
    // viem's PrivateKeyAccount has .address and signing methods → satisfies
    // genlayer-js's Account type and signs every transaction locally.
    account: account ?? undefined,
  } as Parameters<typeof createClient>[0]);
}
