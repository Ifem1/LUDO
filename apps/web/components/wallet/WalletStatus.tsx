"use client";

import { useAuth } from "@/hooks/useAuth";

export function WalletStatus() {
  const { isSignedIn, shortAddress, email } = useAuth();
  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-soft px-3 py-1.5 text-sm">
      <span className="h-2 w-2 rounded-full bg-accent-green" />
      <span className="text-text-muted">{email}</span>
      <span className="font-mono text-xs text-text-dark">{shortAddress}</span>
    </div>
  );
}
