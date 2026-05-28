# Architecture

## Overview

LudoProof is a **backendless** Web3 game. There is no backend server, no database, and no centralised API. All game state is stored in a GenLayer Intelligent Contract.

```
Browser (Next.js)
  │
  ├── RainbowKit / wagmi        ← Wallet connection
  ├── GenLayer JS SDK           ← Contract reads/writes
  ├── TanStack Query            ← Polling + caching
  ├── Zustand                   ← Local UI state
  └── localStorage              ← Raw seed storage only
        │
        ▼
  GenLayer Studionet (or mainnet)
        │
        └── LudoProof.py        ← Intelligent Contract (source of truth)
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript strict, Tailwind CSS, Framer Motion |
| State management | Zustand (local), TanStack Query (contract reads) |
| Wallet | RainbowKit + wagmi + viem |
| Contract SDK | genlayer-js (latest) |
| Smart contract | Python GenLayer Intelligent Contract (py-genlayer v0.2.16) |

## Data Flow

### Read path
1. TanStack Query calls `glGetGame(gameId)` on a polling interval
2. `glGetGame` calls `client.readContract({ functionName: "get_game", args: [gameId] })`
3. GenLayer RPC executes the view method on the contract
4. Response JSON is parsed by `lib/genlayer/parser.ts` into typed `GameState`
5. Zustand game store is updated
6. React components re-render

### Write path
1. User action (roll, move, forfeit)
2. `useGenLayerContract` hook called with wallet account
3. `client.writeContract(...)` sends signed transaction to GenLayer
4. Transaction hash returned; UI shows "pending"
5. After delay, TanStack Query invalidates and refetches game state
6. UI updates from official contract state

## No Backend Guarantee

- Game logic is not on the frontend. The frontend cannot decide dice results.
- Move validation happens in the contract; invalid moves are rejected with an error.
- Winner detection happens in the contract; the frontend only displays what the contract says.
- Leaderboard data comes from contract storage, not a database.
