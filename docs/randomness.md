# Randomness Design (v0.3 — GenLayer-consensus hybrid)

## Why this changed

In v0.2 the dice were derived purely from a commit-reveal seed via `sha256`. That
made the contract reproducible on any deterministic EVM, which is why the first
LudoProof submission was rejected: it didn't use GenLayer consensus for any
meaningful non-deterministic step.

v0.3 keeps commit-reveal (it still binds each player to their roll) and adds a
live validator-consensus entropy source on top.

## The hybrid scheme

Each roll mixes two independent entropy sources:

1. **Player-bound entropy (commit-reveal, unchanged):** each player commits
   `sha256(rawSeed)` before the game starts; on their turn they reveal `rawSeed`
   and the contract verifies the hash.
2. **Network-bound entropy (new, via GenLayer consensus):** the contract calls
   `gl.eq_principle_strict_eq(_fetch)` where `_fetch` pulls the latest round
   from the [drand](https://drand.love) public randomness beacon
   (`https://api.drand.sh/public/latest`) and returns
   `sha256(payload)`. Every validator independently fetches drand. Consensus
   only passes if their hashes agree, so a single dishonest validator cannot
   manipulate the result.

The two are combined as:

```
beacon = gl.eq_principle_strict_eq(lambda: sha256(drand_payload))
d1     = sha256(gameId | player | rawSeed | beacon | rollNonce | moveCount | "d0") % 6 + 1
d2     = sha256(gameId | player | rawSeed | beacon | rollNonce | moveCount | "d1") % 6 + 1
```

## Why this is fair *and* GenLayer-native

- The player cannot predict the dice when committing — drand's next round is
  unknown ahead of time.
- The validators cannot predict the dice either — the player's `rawSeed` is
  still secret at commit time.
- No single validator can rewrite history — `eq_principle_strict_eq` rejects
  the transaction unless every validator agrees on the beacon hash.
- The contract is no longer reproducible on a deterministic EVM: replaying the
  same inputs without GenLayer's non-deterministic web call cannot reach the
  same result.

## AI opponent (`mode: "vs_ai"`)

When a game is created with `mode="vs_ai"`, a sentinel player at
`0xai00000000000000000000000000000000000ai` is seated automatically.
`ai_take_turn(game_id)` performs the AI's full turn:

- **Dice:** sourced from the same drand beacon (no commit-reveal — the AI has
  no wallet to commit from).
- **Token choice:** `gl.eq_principle_prompt_comparative` wrapping
  `gl.nondet.exec_prompt`. Each validator asks an LLM which legal token to
  advance; consensus only passes if their answers agree on the index. The
  principle string constrains the LLM's output to JSON `{"token": <index>}`
  with the index drawn from the legal-moves list.

The AI is excluded from the leaderboard.

## Dispute system

Any player in a game may file a natural-language dispute about a specific move
via `submit_dispute(game_id, move_number, claim)`. `resolve_dispute(dispute_id)`
asks an LLM, under comparative equivalence, to rule on the claim given the
last 20 moves of history. Rulings are `upheld` or `rejected`; the principle
string requires validators to agree on the ruling field.

## Important caveats

- **drand fetch latency.** Validators must hit the same drand round. The
  beacon updates every ~3s; if two validators straddle a round change,
  consensus retries. In practice this resolves within one re-run.
- **Each rawSeed is used once per `rollNonce`.** The nonce increments per
  roll, so a single revealed seed produces different dice on different turns.
- **rawSeed lives in localStorage.** If you clear browser storage before
  rolling, you cannot roll from that device.
- **Frontend dice animation is illustrative only.** The authoritative pair
  comes from contract state after the transaction is finalised.

## Replicating the derivation client-side

The mixing formula is implemented in
`apps/web/lib/crypto/dice-proof.ts` (`deriveSingleDieLocally` /
`deriveDicePairLocally`). To replay a roll offline you need: `gameId`,
`playerAddress`, `rawSeed`, `rollNonce`, `moveCount`, and the `beacon` hash
emitted by the contract for that roll.
