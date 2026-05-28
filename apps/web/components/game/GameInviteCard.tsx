"use client";

import { useState } from "react";

type Props = {
  gameId: string;
};

export function GameInviteCard({ gameId }: Props) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?gameId=${gameId}`
      : `/join?gameId=${gameId}`;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="mb-1 text-sm font-semibold text-text-dark">Invite Link</p>
      <p className="mb-3 font-mono text-xs text-text-muted break-all">{url}</p>
      <button
        onClick={copy}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
