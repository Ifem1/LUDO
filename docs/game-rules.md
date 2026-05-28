# Ludo Rules (two-dice variant, as enforced by the contract)

## Setup

- 2, 3, or 4 players
- Each player picks a unique colour: red, blue, yellow, or green
- Each player has 4 tokens
- All tokens start in their player's base (position -1)
- Turn order follows colour order: red → blue → yellow → green

## The Two-Dice Cup

Both dice are rolled together (one cup, one throw — the South Asian / West African
Pachisi-style variant). The values are derived deterministically from the player's
revealed seed and verified by the GenLayer contract:

```
d1 = sha256(gameId | player | seed | rollNonce | moveCount | "d0") % 6 + 1
d2 = sha256(gameId | player | seed | rollNonce | moveCount | "d1") % 6 + 1
```

The player must use **both** values to move tokens. The values can be applied:

- One value at a time, in any order the player chooses
- To **any** of their own tokens (the same token twice, or two different tokens)

Each `submit_move(gameId, tokenIndex, dieValue)` call spends one of the unspent
dice values. After both values are spent, the turn ends (unless doubles were
rolled — see below).

## Positions

| Position | Meaning |
|----------|---------|
| -1 | Token is in base |
| 0–51 | Shared outer path (logical local position) |
| 52–57 | Home lane (colour-specific, cannot be captured) |
| 58 | Finished |

## Colour Offsets (path entry points)

| Colour | Global path entry square |
|--------|--------------------------|
| Red | 0 |
| Blue | 13 |
| Yellow | 26 |
| Green | 39 |

## Movement Rules

1. A token in base requires a **6** on either die to enter the board (moves to local position 0).
2. On subsequent turns, tokens move forward by the die value being applied.
3. A token must land **exactly** on position 58 to finish. Overshooting is illegal.
4. Home lane positions (52–57) are colour-specific and cannot be captured.

## Special Rules

- **Doubles** (d1 == d2): after both values are spent, the same player gets a bonus turn (rolls again).
- **Three consecutive doubles**: the third roll is cancelled and the turn advances.
- **Capturing**: landing on an opponent's token on a non-safe shared square sends it back to base.
- **Stranded dice**: if after using one die the remaining die has no legal move, the remaining die is forfeited and the turn ends.
- **No moves at all**: if neither die has a legal move on the roll, the turn passes immediately.

## Safe Squares

Global shared-path positions that cannot be captured:
`0, 8, 13, 21, 26, 34, 39, 47`

These are typically the entry squares for each colour.

## Winning

A player wins when all 4 of their tokens are at position 58.

## Forfeiting

A player can forfeit at any time. If only one non-forfeited player remains, that player is declared the winner.

The creator can cancel the game before it starts.
