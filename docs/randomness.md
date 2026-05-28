# Randomness Design (two-dice variant)

## Commit-Reveal Scheme

LudoProof uses a commit-reveal protocol for dice fairness. Both dice of a single
roll are derived from one revealed seed, but with a distinct nonce tag for each
die so the values are independent yet deterministic.

### Phase 1: Commitment (before game starts)

Each player:
1. Generates a raw seed: `seed = randomUUID() + walletAddress + Date.now()`
2. Saves the raw seed to `localStorage` under key `ludoproof_seed:{gameId}:{wallet}`
3. Computes `commitment = sha256(rawSeed)`
4. Calls `commit_seed(gameId, commitment)` on the contract

### Phase 2: Reveal (during your turn)

When it's your turn to roll:
1. Retrieve raw seed from localStorage
2. Call `roll_dice(gameId, rawSeed)`
3. Contract verifies: `sha256(rawSeed) == storedCommitment`
4. Contract derives **two** dice values, each tagged with its index:

```
d1 = sha256(gameId | player | rawSeed | rollNonce | moveCount | "d0") % 6 + 1
d2 = sha256(gameId | player | rawSeed | rollNonce | moveCount | "d1") % 6 + 1
```

## Why this is fair

- You cannot know either dice result before committing (hash pre-image resistance).
- You cannot change your seed after committing (binding property of SHA-256).
- d1 and d2 are tied to different domain-separator tags (`d0`, `d1`), so neither value can be predicted independently.
- Anyone can verify a roll offline given: gameId, player address, rawSeed, rollNonce, moveCount.

## Important Caveats

- **Each seed is used once per roll nonce.** `rollNonce` increments per roll, so the same seed produces different dice pairs on different turns.
- **Seed lives in localStorage.** If you clear browser storage before rolling, you cannot roll from that device. The frontend shows a warning if the seed is missing.
- **Frontend dice animation is illustrative only.** The authoritative pair comes from the contract state after the transaction is confirmed.

## Replicating the derivation client-side

The same formulas are implemented in `apps/web/lib/crypto/dice-proof.ts`
(`deriveSingleDieLocally` and `deriveDicePairLocally`) so the proof panel can
show users the exact derivation for verification.
