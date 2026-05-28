# LudoProof

**Provably fair, backendless Ludo on GenLayer — two-dice variant.**

All game logic, dice verification, and player history live in a GenLayer Intelligent Contract. There is no backend, no database, and no centralised operator that can alter game results.

This implementation uses the **two-dice cup** Ludo rule set common in Nigeria, India, and Pakistan: both dice are rolled together, and the player applies each value to a token of their choice. Rolling doubles grants a bonus turn.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript (strict), Tailwind CSS, Framer Motion |
| Wallet | RainbowKit, wagmi, viem |
| Contract SDK | genlayer-js (latest) |
| State | Zustand + TanStack Query |
| Smart contract | Python GenLayer Intelligent Contract (py-genlayer v0.2.16) |
| Monorepo | pnpm workspaces + Turborepo |

---

## No Backend

- No Express, NestJS, Supabase, Firebase, PostgreSQL, or Redis.
- Frontend talks directly to GenLayer RPC for all contract reads and writes.
- Game state is stored in the contract's TreeMap storage.
- Dice randomness uses a commit-reveal protocol verified by the contract.

---

## Install

```bash
cd ludoproof
pnpm install
```

---

## Environment Setup

Copy `.env.example` to `apps/web/.env.local`:

```bash
cp .env.example apps/web/.env.local
```

Then fill in:

```env
NEXT_PUBLIC_APP_NAME=LudoProof
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...   # After deploying the contract
NEXT_PUBLIC_GENLAYER_RPC_URL=http://localhost:4000/api
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
```

---

## Run Locally

```bash
pnpm web
# or
cd apps/web && pnpm dev
```

App runs at http://localhost:3000

---

## Deploy the Contract to GenLayer Studionet

1. Install GenLayer CLI or open the Studionet web interface.
2. Deploy `contracts/genlayer/ludoproof.py`.
   - The contract header pins the exact py-genlayer version:
     ```
     # v0.2.16
     # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
     ```
   - Do NOT use `py-genlayer:latest`.
3. Copy the deployed contract address.
4. Add it to `apps/web/.env.local` as `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...`.
5. Restart the dev server.

---

## Game Flow

1. Create a game → select 2/3/4 players → pick colour
2. Invite friends with the generated link
3. Each player joins and a cryptographic seed is auto-committed on-chain
4. Creator starts the game when all players have joined and committed
5. Take turns rolling dice (commit-reveal, verified by contract) and moving tokens
6. Capture opponents, bring all 4 tokens home to win
7. View full match history and leaderboard on-chain

---

## Dice Fairness

Dice rolls are derived from cryptographically committed player seeds and verified by GenLayer. Each roll produces **two** independent dice values:

```
seed = randomUUID() + walletAddress + Date.now()
commitment = sha256(seed)

# On turn:
d1 = sha256(gameId|player|seed|rollNonce|moveCount|"d0") % 6 + 1
d2 = sha256(gameId|player|seed|rollNonce|moveCount|"d1") % 6 + 1
```

The contract verifies `sha256(revealedSeed) == committedHash` before deriving the pair.

---

## Limitations

- No push notifications or real-time presence (polling-based).
- Raw seed stored in browser localStorage — clearing storage means you cannot roll from that device.
- Leaderboard iterates contract storage linearly (fine for MVP; may need indexer at production scale).
- No in-game chat.

---

## Future Improvements

- GenLayer LLM calls for dispute explanation, fair-play analysis, and match summaries.
- Off-chain indexer for large-scale leaderboard.
- Seed backup/export mechanism.
- Tournament mode.
- Mobile wallet support.

---

## Confirmations

- py-genlayer:latest was **NOT** used.
- Contract starts with `# v0.2.16` and the exact Depends hash.
- No GitHub push was performed. Build is local only.
- No backend of any kind is used. GenLayer contract is the sole source of truth.
