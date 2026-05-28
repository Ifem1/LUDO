"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

type Props = {
  children: React.ReactNode;
  message?: string;
};

/**
 * Gates protected pages on a signed-in embedded wallet. Replaces the old
 * external-wallet RainbowKit guard.
 */
export function WalletGuard({
  children,
  message = "Sign in to your embedded wallet to continue.",
}: Props) {
  const { isSignedIn } = useAuth();
  const [modal, setModal] = useState<"signin" | "signup" | null>(null);

  if (isSignedIn) return <>{children}</>;

  return (
    <>
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="rounded-2xl bg-surface p-10 shadow-sm ring-1 ring-border max-w-md">
          <p className="mb-2 text-lg font-semibold text-text-dark">
            Wallet Required
          </p>
          <p className="mb-8 text-text-muted">{message}</p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setModal("signup")}
              className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create Account & Wallet
            </button>
            <button
              onClick={() => setModal("signin")}
              className="rounded-xl border border-border bg-surface px-6 py-2.5 font-semibold text-text-dark transition-colors hover:bg-surface-soft"
            >
              Sign In
            </button>
          </div>

          <p className="mt-6 rounded-lg bg-surface-soft p-3 text-[11px] text-text-muted">
            🔐 No MetaMask required. We create a permanent wallet encrypted with
            your password and stored in this browser.
          </p>
        </div>
      </div>

      <AuthModal
        open={modal !== null}
        initialMode={modal ?? "signup"}
        onClose={() => setModal(null)}
      />
    </>
  );
}
