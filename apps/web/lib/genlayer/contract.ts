"use client";

import { env } from "@/lib/env";

export function getContractAddress(): `0x${string}` {
  const addr = env.contractAddress;
  if (!addr) {
    throw new Error(
      "NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is not set. Deploy the contract and add it to .env.local"
    );
  }
  return addr as `0x${string}`;
}

export function isContractConfigured(): boolean {
  return Boolean(env.contractAddress);
}
