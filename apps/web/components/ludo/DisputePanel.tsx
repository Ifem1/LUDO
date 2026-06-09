"use client";

import { useState } from "react";
import { useGenLayerContract } from "@/hooks/useGenLayerContract";
import { glGetDispute } from "@/lib/genlayer/calls";
import type { GameState } from "@ludoproof/shared";
import type { RawDisputeContract } from "@/types/contract";

export function DisputePanel({ game }: { game: GameState }) {
  const { submitDispute, resolveDispute } = useGenLayerContract(game.gameId);
  const [open, setOpen] = useState(false);
  const [moveNumber, setMoveNumber] = useState<number>(game.moveCount);
  const [claim, setClaim] = useState("");
  const [busy, setBusy] = useState(false);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [dispute, setDispute] = useState<RawDisputeContract | null>(null);

  if (game.status === "waiting" || game.status === "seed_commit") return null;

  async function handleSubmit() {
    if (!claim.trim()) return;
    setBusy(true);
    try {
      await submitDispute(moveNumber, claim.trim());
      // The dispute_id format from the contract is `${gameId}:${n}`. We can't
      // easily read the return value here without parsing the tx receipt, so
      // poll get_dispute by scanning the most likely id (last index).
      // Pragmatic: caller can paste the id returned in the toast.
      setClaim("");
    } catch {
      // hook toast
    } finally {
      setBusy(false);
    }
  }

  async function handleLookup(id: string) {
    const d = await glGetDispute(id);
    setDispute(d);
  }

  async function handleResolve() {
    if (!disputeId) return;
    setBusy(true);
    try {
      await resolveDispute(disputeId);
      const d = await glGetDispute(disputeId);
      setDispute(d);
    } catch {
      // hook toast
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-muted"
      >
        <span>Disputes (LLM-judged)</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-dark">Move #</label>
            <input
              type="number"
              value={moveNumber}
              onChange={(e) => setMoveNumber(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-dark">Your complaint</label>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g. opponent's token #2 should have been captured on square 21"
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={busy || !claim.trim()}
            className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Submitting…" : "File dispute"}
          </button>

          <div className="border-t border-border pt-3">
            <label className="mb-1 block text-xs font-semibold text-text-dark">
              Look up / resolve dispute
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={disputeId ?? ""}
                onChange={(e) => setDisputeId(e.target.value)}
                placeholder={`${game.gameId}:0`}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs"
              />
              <button
                onClick={() => disputeId && handleLookup(disputeId)}
                disabled={!disputeId}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-soft disabled:opacity-50"
              >
                View
              </button>
            </div>
            {dispute && (
              <div className="mt-2 space-y-1 rounded-lg bg-surface-soft p-3 text-xs">
                <p>
                  <strong>Status:</strong> {dispute.status}
                </p>
                <p>
                  <strong>Claim:</strong> {dispute.claim}
                </p>
                {dispute.ruling && (
                  <p>
                    <strong>Ruling:</strong>{" "}
                    <span
                      className={
                        dispute.ruling === "upheld" ? "text-success" : "text-danger"
                      }
                    >
                      {dispute.ruling}
                    </span>
                  </p>
                )}
                {dispute.rationale && (
                  <p>
                    <strong>Rationale:</strong> {dispute.rationale}
                  </p>
                )}
                {dispute.status === "pending" && (
                  <button
                    onClick={handleResolve}
                    disabled={busy}
                    className="mt-2 w-full rounded-lg bg-accent-green py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {busy ? "Asking LLM…" : "Resolve via LLM"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
