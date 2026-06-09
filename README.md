# LudoProof

**Provably fair, backendless Ludo on GenLayer — two-dice variant.**

LudoProof is the classic two-dice South Asian / West African Ludo, rebuilt with **zero backend**. Every dice roll, every move, every capture, the winner check, and the persistent leaderboard all live inside a single Python GenLayer Intelligent Contract. The browser talks straight to that contract through GenLayer's RPC. There is no API server, no database, no third-party platform that could rig a game or tamper with stats.

Players sign up with email + password and instantly get a permanent **browser-embedded wallet** — no MetaMask, no extension, no QR codes. The private key is generated locally, encrypted with their password (PBKDF2 + AES-GCM), stored in the browser, and used to silently sign every GenLayer transaction.

🎲 Live demo: deployed on Vercel · Contract on GenLayer Studionet

> **v0.3 — GenLayer-consensus update.** Dice are now produced by mixing the
> player's commit-reveal seed with a drand beacon round fetched via
> `gl.eq_principle_strict_eq` (validator consensus over a non-deterministic
> external call). The contract additionally ships a **vs-AI mode** driven by
> `gl.exec_prompt` under the comparative equivalence principle, and a
> **dispute system** in which players file natural-language complaints that an
> LLM adjudicates. See [docs/randomness.md](docs/randomness.md) for the full
> design.

---

## Table of Contents

- [Why LudoProof](#why-ludoproof)
- [How GenLayer powers the game](#how-genlayer-powers-the-game)
- [The Two-Dice Variant](#the-two-dice-variant)
- [Provably-Fair Dice — Commit & Reveal](#provably-fair-dice--commit--reveal)
- [The Embedded Wallet](#the-embedded-wallet)
- [Stack](#stack)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [Deploy the Contract](#deploy-the-contract-to-genlayer-studionet)
- [Deploy the Frontend](#deploy-the-frontend-to-vercel)
- [Game Flow](#game-flow)
- [Contract Method Reference](#contract-method-reference)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

---

## Why LudoProof

Most online board games rely on a server that decides what happens. You trust that the operator's dice roll is fair. You trust that their leaderboard isn't fudged. You trust them not to lose your match history when they shut down.

LudoProof removes the operator entirely:

- ✅ **Provably fair dice** — anyone can verify a roll given the revealed seed, the game ID, the player's address, and a couple of public counters.
- ✅ **No operator can rig outcomes** — the contract is the referee, and its rules are open-source Python.
- ✅ **No data loss** — the leaderboard, every move of every game, and player stats all live on-chain forever.
- ✅ **Censorship-resistant** — there is no company that can ban a player or delete a game.
- ✅ **Onboarding without a wallet extension** — email + password is enough; the embedded wallet is created in 30 ms.

---

## How GenLayer powers the game

The Python contract at `contracts/genlayer/ludoproof.py` is the **sole source of truth**. The frontend is *only* a display layer.

### The contract owns…

| Game data | Where it lives |
|-----------|----------------|
| Active games | `TreeMap[str, str]` — keyed by game ID, value is JSON-encoded game state |
| Player stats | `TreeMap[str, str]` — keyed by lowercased wallet address |
| Leaderboard index | Sequential `TreeMap` so the contract can enumerate all players |
| Recent / open games | Two sequential `TreeMap`s so the lobby browser can list joinable games |
| Total games / players | `u256` counters |

### The contract enforces…

- Whose turn it is, in colour order red → blue → yellow → green
- That a token can only enter the board on a roll of 6
- That a token's path stays on its own colour's home column (no cheating into opponent lanes)
- That a move lands exactly on position 58 to finish (no overshoot)
- That captures only happen on non-safe shared squares
- That doubles grant a bonus turn, and three consecutive doubles cancel the third roll
- That every dice roll is verified against the committed hash before being trusted

### Deterministic by design

Core gameplay does **not** use any LLM call. Every validator on the GenLayer network executes the same Python and reaches the same game state, so consensus is fast and predictable. (GenLayer's LLM features are reserved for future use — dispute explanation, fair-play analysis, match summaries.)

### Talking to the contract

The frontend uses **genlayer-js** to call contract methods directly from the browser:

```ts
// Read
const game = await client.readContract({ address, functionName: "get_game", args: [gameId] });

// Write (signed locally by the embedded wallet)
await client.writeContract({ account, address, functionName: "submit_move", args: [gameId, tokenIdx, dieValue], value: 0n });
```

No backend in between. The signed transaction goes straight from the browser to GenLayer Studionet's RPC.

---

## The Two-Dice Variant

LudoProof implements the **two-dice cup** rule set commonly played in Nigeria, India, and Pakistan — both dice rolled together, applied independently.

| Rule | Detail |
|------|--------|
| Roll | Two six-sided dice rolled together per turn |
| Apply | Each die's value is spent on a token of the player's choice (the same token twice, or two different tokens) |
| Enter board | A token leaves base only on a die showing 6 |
| Doubles | If `d1 == d2`, the player gets a bonus turn after spending both dice |
| Three doubles | Third consecutive double is cancelled and the turn passes |
| Captures | Landing on an opponent's token on a non-safe shared square sends that token back to base |
| Safe squares | The 8 contract-defined squares (4 starts + 4 stars) where capture is not allowed |
| Win | All four tokens reach position 58 (the centre) |
| Stranded die | If after using one die the other has no legal move, it is forfeited |

Full rules: [`docs/game-rules.md`](docs/game-rules.md).

---

## Provably-Fair Dice — Commit & Reveal

LudoProof avoids the "trust me bro" problem of online dice with a classic commit-reveal:

```
Before the game (commit):
    rawSeed   = randomUUID() + walletAddress + Date.now()    // generated locally
    commitment = sha256(rawSeed)                              // stored in browser
    commit_seed(gameId, commitment)                           // pushed to contract

On your turn (reveal):
    roll_dice(gameId, rawSeed)
        contract checks: sha256(rawSeed) == commitment
        contract derives:
            d1 = sha256(gameId | player | rawSeed | rollNonce | moveCount | "d0") % 6 + 1
            d2 = sha256(gameId | player | rawSeed | rollNonce | moveCount | "d1") % 6 + 1
```

Properties:

- **Binding:** SHA-256 pre-image resistance means you can't change `rawSeed` after committing.
- **Hiding:** Other players can't guess your seed from the commitment.
- **Verifiable:** Anyone can replay the formula given the revealed seed and a few public counters.
- **Independent dice:** Domain-separator tags (`"d0"` and `"d1"`) ensure `d1` doesn't leak `d2`.
- **Unique per roll:** `rollNonce` increments each turn, so the same seed produces different dice every roll.

Details: [`docs/randomness.md`](docs/randomness.md).

---

## The Embedded Wallet

External wallet friction is the #1 onboarding killer for Web3 games. LudoProof removes it:

1. **Sign up** with email + password (minimum 8 characters)
2. The frontend calls `viem.generatePrivateKey()` to generate a fresh wallet
3. **PBKDF2** (200 000 iterations, SHA-256) derives an AES-256 key from your password and a random 16-byte salt
4. **AES-GCM** encrypts the private key with a fresh 12-byte IV
5. The encrypted blob is stored in `localStorage["ludoproof_accounts_v1"]`
6. The decrypted private key lives **only in memory** (never persisted)
7. Every GenLayer transaction is signed by that key — no popups, no prompts

| | Encrypted? | Persisted? |
|---|---|---|
| Encrypted keystore | ✅ AES-GCM, password-derived | ✅ localStorage |
| In-memory `PrivateKeyAccount` | ❌ | ❌ — cleared on refresh or sign-out |

A hard refresh signs you out; you re-enter your password to unlock. That's intentional — an auto-unlocking wallet defeats the encryption.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Smart contract | Python GenLayer Intelligent Contract (py-genlayer **v0.2.16** pinned) |
| Contract SDK | [genlayer-js](https://docs.genlayer.com/api-references/genlayer-js) v1.x |
| Frontend | Next.js 15 (App Router), TypeScript strict, Tailwind CSS, Framer Motion |
| Embedded wallet | viem `privateKeyToAccount` + Web Crypto API (PBKDF2 + AES-GCM) |
| State | Zustand (UI) + TanStack Query (contract polling) |
| Monorepo | pnpm workspaces |

There is **no** RainbowKit, wagmi, WalletConnect, Express, NestJS, Supabase, Firebase, PostgreSQL, MongoDB, or Redis in the runtime path.

---

## Project Structure

```
ludoproof/
├── apps/
│   └── web/                     Next.js 15 frontend
│       ├── app/                 Pages (App Router)
│       │   ├── page.tsx         Landing
│       │   ├── create/          Create new game
│       │   ├── join/            Join existing game
│       │   ├── game/[gameId]/   Live game board
│       │   ├── leaderboard/     On-chain leaderboard
│       │   └── history/         Recent games + match replay
│       ├── components/
│       │   ├── auth/            Sign-in/up modal, account menu
│       │   ├── ludo/            Board, dice, tokens, controls
│       │   ├── game/            Game-level helpers
│       │   ├── layout/          Navbar, shell, footer
│       │   └── wallet/          Wallet-guard (auth gating)
│       ├── lib/
│       │   ├── auth/            Encryption, account storage
│       │   ├── crypto/          SHA-256, seed generation, dice proof
│       │   ├── genlayer/        Typed contract calls + parser
│       │   └── ludo/            Pure rule engine (path, rules, geometry)
│       ├── hooks/               useAuth, useGamePolling, useDice, …
│       └── store/               Zustand stores (auth, game, ui, seed)
├── packages/
│   └── shared/                  Cross-package types + board constants
├── contracts/
│   └── genlayer/
│       ├── ludoproof.py         The Intelligent Contract (DO NOT use py-genlayer:latest)
│       ├── README.md            Contract API reference
│       └── examples/            JSON examples for every method
├── docs/                        Architecture, rules, randomness, etc.
├── pnpm-workspace.yaml          Workspace + viem/connector overrides
└── vercel.json                  Monorepo deploy config
```

---

## Run Locally

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9

### Install

```bash
git clone https://github.com/Ifem1/LUDO.git ludoproof
cd ludoproof
pnpm install
```

### Configure env

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_APP_NAME=LudoProof
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x3eCE769896174391c411aC6FDC4C054386D5E189
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

### Run

```bash
pnpm web
```

App at **http://localhost:3000**.

---

## Deploy the Contract to GenLayer Studionet

1. Open https://studio.genlayer.com/
2. Connect your wallet
3. Create a new contract, paste the full content of `contracts/genlayer/ludoproof.py`
4. **Keep the first two lines exactly as written** — they pin the runtime version:
   ```python
   # v0.2.16
   # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
   ```
   ⚠ Do NOT use `py-genlayer:latest`. The exact Depends hash must remain.
5. Click **Deploy**, sign the transaction, copy the deployed address
6. Paste it into `apps/web/.env.local` as `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`
7. Restart the dev server

---

## Deploy the Frontend to Vercel

```bash
npm install -g vercel
vercel login
vercel             # preview build
vercel --prod      # production build
```

Add env vars on Vercel (one-time):

```bash
vercel env add NEXT_PUBLIC_APP_NAME production
vercel env add NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS production
vercel env add NEXT_PUBLIC_GENLAYER_RPC_URL production
vercel env add NEXT_PUBLIC_CHAIN_ID production
```

Then `vercel --prod` again so the variables bake into the build.

The repo includes `vercel.json` which tells Vercel how to handle the pnpm monorepo:

```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

---

## Game Flow

```
1. Sign up        → embedded wallet created, encrypted in browser
2. Create game    → create_game(gameId, maxPlayers)
                  → join_game(gameId, "red")
                  → commit_seed(gameId, sha256(seed))
3. Friends join   → join_game + commit_seed for each
4. Start game     → start_game(gameId) by creator
5. Play turns:
     a. roll_dice(gameId, rawSeed)              ← contract derives [d1, d2]
     b. submit_move(gameId, tokenIdx, d1)       ← apply first die
     c. submit_move(gameId, tokenIdx, d2)       ← apply second die
        — if doubles, same player rolls again at (a)
6. Win            → all 4 tokens at position 58; stats and leaderboard auto-updated
7. Replay         → /history/{gameId} shows every move
```

The frontend polls `get_game(gameId)` every 3 seconds while a game is active, every 5 seconds in lobby state, and stops on completion.

---

## Contract Method Reference

| Type | Method | Description |
|------|--------|-------------|
| Write | `create_game(gameId, maxPlayers)` | Open a new lobby (2/3/4 players) |
| Write | `join_game(gameId, colour)` | Take a colour seat |
| Write | `commit_seed(gameId, seedHash)` | Commit `sha256(rawSeed)` |
| Write | `start_game(gameId)` | Creator-only; requires all seats filled + seeds committed |
| Write | `roll_dice(gameId, revealedSeed)` | Verify seed, derive `[d1, d2]` |
| Write | `submit_move(gameId, tokenIndex, dieValue)` | Spend one die on one token |
| Write | `forfeit_game(gameId)` | Surrender current game |
| Write | `cancel_game(gameId)` | Creator cancels before start |
| View | `get_game(gameId)` | Full game state JSON |
| View | `get_current_turn(gameId)` | Who plays, what dice remain |
| View | `get_valid_moves(gameId)` | `{per_die: [{die, tokens}], remaining}` |
| View | `get_move_history(gameId)` | Every move ever played in the game |
| View | `get_player_stats(address)` | Wins, losses, captures, forfeits, total moves, win rate |
| View | `get_leaderboard(limit)` | Up to `limit` players' stats |
| View | `get_recent_games(limit)` | Latest games (lobby browser) |
| View | `get_open_games(limit)` | Joinable games |
| View | `contract_version()` | Schema/version string |

Full JSON examples for each method are in `contracts/genlayer/examples/`.

---

## Limitations

- **No real-time presence.** State sync is polling-based (3 / 5 second intervals). No WebSockets, no push.
- **Browser-bound wallet.** The encrypted keystore lives in `localStorage`. If you clear browser data on a device, you cannot access that account from that device. (A future "Export keystore JSON" + "Import keystore" pair would solve this — currently on the roadmap.)
- **Leaderboard scaling.** The contract iterates storage linearly. Fine for MVP / testnet; a production deployment at scale would benefit from an off-chain indexer.
- **No in-game chat.** No backend → no relay for messages.
- **Single-6 unlock rule.** The contract requires a single die showing 6 to leave base. A "sum-equals-6" variant is implemented in the frontend rule engine but requires a contract redeploy to activate.

---

## Future Improvements

- **GenLayer LLM features** — dispute explanation, suspicious-move review, post-match narrative summaries, "fair play" badges
- **Keystore export/import** — let players move their wallet between devices
- **Off-chain indexer** — for fast large-scale leaderboard queries
- **Tournament mode** — bracketed multi-round play with on-chain prize escrow
- **Mobile-native wrapper** — Capacitor or Tauri shell so it feels like a real app
- **Sum-equals-6 variant** — a contract redeploy to support the alternative unlock rule
- **Streamer / spectator mode** — read-only replay of any past game

---

## Confirmations

- ✅ `py-genlayer:latest` is **NOT** used
- ✅ Contract starts with `# v0.2.16` and the exact Depends hash
- ✅ No backend of any kind. The GenLayer contract is the sole source of truth
- ✅ Embedded wallet is fully client-side (no Web3Auth, no Magic, no third-party SaaS)

---

## License

MIT.

---

## Acknowledgements

- **GenLayer** for the Intelligent Contract platform and validator-safe Python runtime
- **viem** for the local-account signing primitives
- **Next.js** + **Tailwind** + **Framer Motion** for the visible layer
