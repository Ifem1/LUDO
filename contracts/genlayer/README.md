# LudoProof — GenLayer Intelligent Contract (Two-Dice Variant)

## Overview

`ludoproof.py` is a **GenLayer Intelligent Contract** written in Python using the GenLayer contract model.

It is the **sole source of truth** for all game state in LudoProof. No backend exists. The frontend reads and writes directly to this contract via the GenLayer RPC.

This is the **two-dice variant** of Ludo — the style commonly played in Nigeria, India, and Pakistan, where both dice are rolled together from a cup and each value is applied separately to one of the player's tokens. Rolling doubles grants a bonus turn.

## Version

```
# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

**Important:** This contract uses `py-genlayer` at the exact hash above. Do NOT deploy using `py-genlayer:latest`. Only use the pinned Depends hash.

## Design Principles

- **Deterministic gameplay**: All core Ludo logic (dice, movement, captures, winner detection) is deterministic and does not use GenLayer's LLM/intelligent features.
- **Commit-reveal dice**: Players commit `sha256(rawSeed)` before the game and reveal `rawSeed` when rolling. The contract verifies and derives **two** independent dice values per roll:
  - `d1 = sha256(gameId|player|rawSeed|rollNonce|moveCount|"d0") % 6 + 1`
  - `d2 = sha256(gameId|player|rawSeed|rollNonce|moveCount|"d1") % 6 + 1`
- **No trusted randomness oracle**: Dice randomness comes entirely from players' committed seeds.
- **Validator-safe**: All contract logic is deterministic and will reach consensus across GenLayer validators.

## Deployment to Studionet

1. Install GenLayer CLI or use the Studionet web interface.
2. Deploy `contracts/genlayer/ludoproof.py` using the exact Depends hash in the header.
3. Copy the deployed contract address.
4. Add it to your frontend `.env.local` as `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...`.

## Public Write Methods

| Method | Args | Description |
|--------|------|-------------|
| `create_game` | `game_id: str, max_players: u256` | Create a new game |
| `join_game` | `game_id: str, colour: str` | Join as red/blue/yellow/green |
| `commit_seed` | `game_id: str, seed_commitment: str` | Commit SHA-256 of raw seed |
| `start_game` | `game_id: str` | Creator starts game (all seeds committed) |
| `roll_dice` | `game_id: str, revealed_seed: str` | Reveal seed, contract verifies + derives `[d1, d2]` |
| `submit_move` | `game_id: str, token_index: u256, die_value: u256` | Apply one die value (3 or 5 etc.) to one token |
| `forfeit_game` | `game_id: str` | Forfeit current game |
| `cancel_game` | `game_id: str` | Creator cancels before game starts |

## Public View Methods

| Method | Args | Returns |
|--------|------|---------|
| `get_game` | `game_id: str` | Full game state JSON |
| `get_game_summary` | `game_id: str` | Compact summary JSON |
| `get_current_turn` | `game_id: str` | Current turn info JSON |
| `get_valid_moves` | `game_id: str` | `{per_die: [{die, tokens}], remaining: [...]}` |
| `get_move_history` | `game_id: str` | Array of move records |
| `get_winner` | `game_id: str` | `{"winner": "0x..."}` |
| `get_player_stats` | `player: str` | Player stat object |
| `get_leaderboard` | `limit: u256` | Array of player stats |
| `get_recent_games` | `limit: u256` | Array of recent game summaries |
| `get_open_games` | `limit: u256` | Array of joinable games |
| `contract_version` | — | `"0.2.16"` |

## Expected Frontend Call Order

```
1. create_game(gameId, maxPlayers)     ← creator
2. join_game(gameId, "red")            ← creator
3. join_game(gameId, "blue")           ← second player
4. commit_seed(gameId, sha256(seed))   ← creator
5. commit_seed(gameId, sha256(seed))   ← second player
6. start_game(gameId)                  ← creator only
7. roll_dice(gameId, rawSeed)                       ← current player's turn (derives [d1, d2])
8. submit_move(gameId, tokenIndex, d1)              ← apply first die
9. submit_move(gameId, tokenIndex, d2)              ← apply second die
   ↳ if [d1, d2] are doubles, the same player rolls again at step 7
   [repeat until winner]
```

## Ludo Rules Enforced (two-dice variant)

- Tokens start at position -1 (base). A **6 on either die** is required to enter the board.
- Positions 0–51: shared outer path. Positions 52–57: colour-specific home lane. Position 58: finished.
- Safe squares (0, 8, 13, 21, 26, 34, 39, 47) cannot be captured.
- Landing on an opponent's token on a non-safe shared square sends it back to base (-1).
- **Doubles** (d1 == d2) → bonus turn after both dice are spent.
- **Three consecutive doubles** → third roll cancelled, turn passes.
- If after using one die the other has no legal move, it's forfeited and the turn ends.
- A player wins when all 4 tokens are at position 58.
