"use client";

import { useUiStore } from "@/store/ui-store";
import { motion, AnimatePresence } from "framer-motion";

export function GenLayerTxStatus() {
  const { txStatus, txMessage, txHash } = useUiStore();

  if (txStatus === "idle") return null;

  const colours = {
    pending: "bg-tx-pending/10 border-tx-pending text-tx-pending",
    success: "bg-tx-ok/10 border-tx-ok text-tx-ok",
    error: "bg-tx-fail/10 border-tx-fail text-tx-fail",
  } as const;

  const icons = { pending: "⏳", success: "✓", error: "✗" } as const;

  return (
    <AnimatePresence>
      <motion.div
        key={txStatus + txMessage}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`fixed right-4 top-20 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${colours[txStatus as keyof typeof colours] ?? ""}`}
      >
        <div className="flex items-center gap-2 font-semibold">
          <span>{icons[txStatus as keyof typeof icons] ?? "•"}</span>
          <span className="capitalize">{txStatus}</span>
        </div>
        {txMessage && <p className="mt-1 text-xs opacity-80">{txMessage}</p>}
        {txHash && (
          <p className="mt-1 truncate font-mono text-[10px] opacity-60">{txHash}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
