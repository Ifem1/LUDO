# No-Backend Design

## What "No Backend" Means

LudoProof has **zero server-side infrastructure** beyond the GenLayer network itself:

- No Express, NestJS, or any HTTP server
- No PostgreSQL, MongoDB, Redis, or any database
- No Supabase, Firebase, or any BaaS platform
- No REST or GraphQL API routes for game logic
- No server-side rendering of game state

## What Exists Instead

| Concern | Solution |
|---------|----------|
| Game state persistence | GenLayer Intelligent Contract (TreeMap storage) |
| Authoritative dice | Commit-reveal + contract hash derivation |
| Player identity | Ethereum wallet address |
| Move validation | Contract enforces all Ludo rules |
| Leaderboard | Contract player_stats TreeMap |
| Game discovery | Contract open_games index |
| History | Contract move_history array per game |

## Trade-offs and Limitations

### Things that work perfectly without a backend

- Game creation, joining, starting
- Provably fair dice rolling
- Move validation and captures
- Winner detection
- Persistent leaderboard
- Match history and replay
- Trustless operation (no operator can tamper)

### Things that would need a backend/indexer at scale

- **Real-time presence**: Who is online? The frontend polls every 3–5 seconds instead.
- **Push notifications**: No WebSockets. Players must keep the game page open.
- **Chat**: Not implemented. Would require a backend or P2P layer.
- **Large leaderboard queries**: The contract iterates storage linearly. Fine for MVP/testnet; a production scale deployment may benefit from an off-chain indexer (The Graph, custom indexer) for sub-millisecond leaderboard queries.

### Seed storage risk

Raw seeds live in `localStorage`. If a player:
- Clears browser storage
- Changes browsers/devices
- Uses incognito mode

...they cannot roll dice for that game. The frontend warns users if the seed is missing. This is a conscious MVP trade-off: no seed escrow server is used.

## Frontend-Contract Trust Model

The frontend is **not trusted** for game logic:

- The frontend may animate dice before the contract responds — this is cosmetic only.
- The contract ignores the frontend's guess of the dice result.
- All moves are validated server-side (by the contract).
- Players cannot submit illegal moves; the contract rejects them.
- The leaderboard cannot be faked; it reads directly from contract storage.
