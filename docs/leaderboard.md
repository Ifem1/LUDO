# Leaderboard

## Data Source

All leaderboard data is read directly from the GenLayer contract via `get_leaderboard(limit)`.

The contract stores player stats in a `TreeMap[str, str]` keyed by normalised wallet address, and maintains a sequential index (`leaderboard_index`) for iteration.

## Stats Tracked

| Field | Description |
|-------|-------------|
| `games_played` | Total games played (any status) |
| `wins` | Games won |
| `losses` | Games lost |
| `captures` | Total tokens captured across all games |
| `forfeits` | Times the player forfeited |
| `total_moves` | Sum of all move counts across their games |
| `win_rate` | (wins / games_played) * 10000 (basis points, so 7500 = 75.00%) |
| `last_played_at` | Approximate block/move number of last game |

## Sorting

The frontend sorts the raw array returned by the contract:
1. `wins` descending
2. `winRate` descending
3. `captures` descending
4. `gamesPlayed` descending

## Display

Win rate is displayed as a percentage: `winRate / 100` formatted to 1 decimal place.

## Limitations

The contract iterates storage linearly to build the leaderboard. This is fine for MVP and testnet scale. For production with thousands of players, an off-chain indexer (The Graph, custom event indexer) would provide significantly faster queries.
