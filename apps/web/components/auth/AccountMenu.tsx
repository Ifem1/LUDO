"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

export function AccountMenu() {
  const { isSignedIn, email, address, shortAddress, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"signin" | "signup" | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!isSignedIn) {
    return (
      <>
        <div className="flex gap-2">
          <button
            onClick={() => setModal("signin")}
            className="rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-text-dark transition-colors hover:bg-surface-soft"
          >
            Sign In
          </button>
          <button
            onClick={() => setModal("signup")}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Sign Up
          </button>
        </div>
        <AuthModal
          open={modal !== null}
          initialMode={modal ?? "signin"}
          onClose={() => setModal(null)}
        />
      </>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:bg-surface-soft"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {email?.[0]?.toUpperCase() ?? "U"}
        </span>
        <span className="hidden font-mono text-xs text-text-muted sm:inline">
          {shortAddress}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-3 shadow-lg">
          <div className="mb-2 border-b border-border pb-2">
            <p className="text-xs text-text-muted">Signed in as</p>
            <p className="break-all text-sm font-semibold text-text-dark">{email}</p>
          </div>

          <div className="mb-2">
            <p className="text-xs text-text-muted">Embedded wallet address</p>
            <div className="mt-1 flex items-center gap-1">
              <code className="flex-1 truncate font-mono text-[11px] text-text-dark">
                {address}
              </code>
              <button
                onClick={copyAddress}
                className="rounded px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-surface-soft"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="my-2 rounded-lg bg-surface-soft p-2 text-[10px] text-text-muted">
            🔐 Wallet is encrypted with your password and stored only in this
            browser. Use the same browser to access this account.
          </div>

          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full rounded-lg border border-border py-1.5 text-sm font-semibold text-text-muted hover:bg-surface-soft hover:text-danger"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
