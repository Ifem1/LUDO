import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-6 text-center text-sm text-text-muted">
      <p>
        <span className="font-semibold text-primary">{APP_NAME}</span> — Backendless, provably fair Ludo verified by{" "}
        <span className="font-semibold text-accent-gold">GenLayer</span>
      </p>
      <p className="mt-1 text-xs">
        No backend. No database. All game logic lives in a GenLayer Intelligent Contract.
      </p>
    </footer>
  );
}
