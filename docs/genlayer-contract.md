# GenLayer Contract Details

## File

`contracts/genlayer/ludoproof.py`

## Version Header (REQUIRED)

```python
# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

Do NOT change this header. Do NOT use `py-genlayer:latest`. The exact Depends hash pins the runtime version.

## Contract Class

```python
class LudoProof(gl.Contract):
    games: TreeMap[str, str]           # gameId → JSON game state
    player_stats: TreeMap[str, str]    # address → JSON stats
    leaderboard_index: TreeMap[str, str]  # sequential index → address
    leaderboard_seen: TreeMap[str, str]   # address → "1" (seen flag)
    recent_games: TreeMap[str, str]    # sequential index → gameId
    open_games: TreeMap[str, str]      # sequential index → gameId
    total_games: u256
    total_players: u256
```

All state is stored as JSON strings in TreeMaps. This is intentional for compatibility with the GenLayer storage model.

## Determinism

The contract intentionally uses no LLM calls for core gameplay. All logic — dice, movement, captures, winner detection — is deterministic and will produce identical results across all GenLayer validators.

## Error Codes

The contract raises `Exception(code)` with human-readable snake_case error codes:

- `game_id_required`
- `game_already_exists`
- `max_players_must_be_2_3_or_4`
- `game_not_joinable`
- `invalid_colour`
- `player_already_joined`
- `colour_taken`
- `game_full`
- `cannot_commit_seed_now`
- `seed_commitment_required`
- `caller_not_player`
- `seed_already_committed`
- `only_creator_can_start`
- `game_cannot_start_from_status`
- `need_at_least_2_players`
- `game_not_full`
- `not_all_players_committed`
- `game_not_active`
- `not_your_turn`
- `player_forfeited`
- `move_pending`
- `seed_not_committed`
- `seed_reveal_does_not_match_commitment`
- `no_move_pending`
- `invalid_token_index`
- `illegal_move`
- `only_creator_can_cancel`
- `cannot_cancel_started_game`
- `cannot_forfeit_now`
- `game_not_found`
