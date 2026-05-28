"use client";

import { AccountMenu } from "@/components/auth/AccountMenu";

/**
 * Re-exported under the legacy name so existing imports keep working.
 * The actual UI is the new AccountMenu (sign-in/sign-up + account dropdown).
 */
export function WalletConnectButton() {
  return <AccountMenu />;
}
