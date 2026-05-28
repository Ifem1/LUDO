import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Powered by GenLayer Intelligent Contracts
        </div>
        <h1 className="mb-4 text-5xl font-black tracking-tight text-text-dark md:text-7xl">
          {APP_NAME}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-text-muted">
          Provably fair Ludo, verified on-chain. No backend. No database. All game logic,
          dice randomness, and player history live in a GenLayer Intelligent Contract.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/create"
            className="rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            Create Game
          </Link>
          <Link
            href="/join"
            className="rounded-xl border-2 border-primary px-8 py-3 font-bold text-primary transition-colors hover:bg-primary/5"
          >
            Join Game
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-black text-text-dark">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Commit a Seed",
              desc: "Each player generates a random seed and commits its SHA-256 hash to the GenLayer contract before the game starts.",
            },
            {
              step: "2",
              title: "Roll On-Chain",
              desc: "When rolling, you reveal your raw seed. The contract verifies the hash and derives dice as sha256(gameId|player|seed|nonce|moveCount) % 6 + 1.",
            },
            {
              step: "3",
              title: "Contract Decides",
              desc: "Every dice result, move, capture, and win is validated by the GenLayer contract. The frontend is only a display layer.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                {step}
              </div>
              <h3 className="mb-2 font-bold text-text-dark">{title}</h3>
              <p className="text-sm text-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* No backend */}
      <section className="mb-16 rounded-2xl bg-surface-soft p-8">
        <h2 className="mb-4 text-xl font-black text-text-dark">No Backend Architecture</h2>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          {[
            ["No database", "All game state lives in the GenLayer contract."],
            ["No API server", "Frontend talks directly to GenLayer RPC."],
            ["No Firebase / Supabase", "No third-party data platform needed."],
            ["No centralised randomness", "Dice derived from commit-reveal cryptography."],
            ["Provably fair", "Anyone can verify a dice roll given the revealed seed."],
            ["Censorship resistant", "No operator can alter game results."],
          ].map(([label, detail]) => (
            <div key={label} className="flex gap-3">
              <span className="mt-0.5 text-accent-green">✓</span>
              <div>
                <span className="font-semibold text-text-dark">{label}: </span>
                <span className="text-text-muted">{detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proof layer */}
      <section className="mb-16">
        <h2 className="mb-4 text-xl font-black text-text-dark">Commit-Reveal Dice</h2>
        <div className="rounded-xl border border-border bg-surface p-6 font-mono text-sm">
          <p className="text-text-muted">// 1. Before game: commit hash of raw seed</p>
          <p className="text-text-dark">commit_seed(gameId, sha256(rawSeed))</p>
          <p className="mt-3 text-text-muted">// 2. On your turn: reveal raw seed to roll</p>
          <p className="text-text-dark">roll_dice(gameId, rawSeed)</p>
          <p className="mt-3 text-text-muted">// 3. Contract verifies and derives dice</p>
          <p className="text-text-dark">
            dice = sha256(gameId|player|rawSeed|rollNonce|moveCount) % 6 + 1
          </p>
        </div>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap justify-center gap-4">
        <Link href="/leaderboard" className="text-sm font-semibold text-primary hover:underline">
          View Leaderboard →
        </Link>
        <Link href="/history" className="text-sm font-semibold text-primary hover:underline">
          View Recent Games →
        </Link>
      </section>
    </div>
  );
}
