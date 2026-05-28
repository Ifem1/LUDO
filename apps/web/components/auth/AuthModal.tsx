"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getLastEmail, listAccountEmails } from "@/lib/auth/storage";

type Mode = "signin" | "signup";

type Props = {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
  onSuccess?: () => void;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Please enter a valid email address.",
  password_too_short: "Password must be at least 8 characters.",
  account_already_exists: "An account with this email already exists. Sign in instead.",
  account_not_found: "No account found for this email. Sign up first.",
  invalid_password: "Wrong password.",
  not_signed_in: "You are not signed in.",
};

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return ERROR_MESSAGES[msg] ?? msg;
}

export function AuthModal({ open, initialMode = "signin", onClose, onSuccess }: Props) {
  const { signUp, signIn } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knownAccounts, setKnownAccounts] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
    const known = listAccountEmails();
    setKnownAccounts(known);
    const last = getLastEmail();
    if (last) setEmail(last);
    else if (known.length > 0) setEmail(known[0]);
  }, [open, initialMode]);

  // Auto-switch to signup if there are no accounts at all.
  useEffect(() => {
    if (open && knownAccounts.length === 0 && mode === "signin") {
      setMode("signup");
    }
  }, [open, knownAccounts.length, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("passwords_do_not_match");
        }
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg === "passwords_do_not_match"
          ? "Passwords do not match."
          : friendlyError(err)
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl"
          >
            <div className="mb-5 flex gap-1 rounded-lg bg-surface-soft p-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ${
                  mode === "signin"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-muted hover:text-text-dark"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ${
                  mode === "signup"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-muted hover:text-text-dark"
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="mb-1 text-xl font-black text-text-dark">
              {mode === "signup" ? "Create your wallet" : "Welcome back"}
            </h2>
            <p className="mb-5 text-sm text-text-muted">
              {mode === "signup"
                ? "We'll create a permanent wallet stored encrypted in this browser."
                : "Unlock your embedded wallet with your password."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-muted">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-text-muted">
                  Password{mode === "signup" && " (min 8 chars)"}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-primary py-2.5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {busy
                  ? mode === "signup"
                    ? "Creating wallet…"
                    : "Unlocking…"
                  : mode === "signup"
                    ? "Create Account & Wallet"
                    : "Sign In"}
              </button>
            </form>

            {mode === "signup" && (
              <p className="mt-4 rounded-lg bg-surface-soft p-3 text-[11px] text-text-muted">
                ⚠ Your password protects your wallet. If you forget it, your wallet
                cannot be recovered — there is no backend, no email reset. Write it
                down somewhere safe.
              </p>
            )}

            <button
              onClick={onClose}
              className="mt-3 w-full text-xs text-text-muted hover:text-text-dark"
              type="button"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
